module Api
  class ServicesController < BaseController
    def index
      render json: Service.order(service_date: :desc)
    end

    def show
      render json: service
    end

    def create
      svc = Service.new(service_params)
      if svc.save
        render json: svc, status: :created
      else
        render json: { errors: svc.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if service.update(service_params)
        render json: service
      else
        render json: { errors: service.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      service.destroy
      head :no_content
    end

    def preview_data
      renderer = SlideRenderer.new
      pages = renderer.render_service(service)
      render json: { pages: pages }
    end

    def export_pdf
      renderer = SlideRenderer.new
      pages = renderer.render_service(service)
      html = print_html({ pages: pages })

      pdf = Grover.new(html,
        display_url: "#{request.base_url}/services/#{service.id}/print/slides",
        viewport: { width: 1920, height: 1080 },
        width: "1920px",
        height: "1080px",
        print_background: true,
        wait_until: "networkidle0",
        wait_for_selector: "#print-ready"
      ).to_pdf

      send_data pdf,
        filename: "#{service.service_date}-slides.pdf",
        type: "application/pdf",
        disposition: "attachment"
    end

    def export_title_card
      data = { sermon_title: service.sermon_title, sermon_reference: service.sermon_reference }
      html = print_html(data)

      png = Grover.new(html,
        display_url: "#{request.base_url}/services/#{service.id}/print/title_card",
        type: "png",
        viewport: { width: 1920, height: 1080 },
        full_page: false,
        omit_background: true,
        wait_until: "networkidle0",
        wait_for_selector: "#print-ready"
      ).to_png

      filename = "#{service.service_date}-title"
      filename += "-#{service.label.downcase}" if service.label.present?
      filename += ".png"

      send_data png,
        filename: filename,
        type: "image/png",
        disposition: "attachment"
    end

    private

    def print_html(data)
      json = data.to_json.gsub("</", "<\\/")

      <<~HTML
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <script>window.__PRINT_DATA__ = #{json};</script>
            #{frontend_assets}
          </head>
          <body>
            <div id="app"></div>
          </body>
        </html>
      HTML
    end

    def frontend_assets
      index_html = frontend_index_path
      return "" unless File.exist?(index_html)

      doc = File.read(index_html)
      scripts = doc.scan(/<script[^>]*src="([^"]+)"[^>]*>/).map do |src,|
        %(<script type="module" crossorigin src="#{src}"></script>)
      end
      styles = doc.scan(/<link[^>]*href="([^"]+\.css)"[^>]*>/).map do |href,|
        %(<link rel="stylesheet" crossorigin href="#{href}">)
      end
      (styles + scripts).join("\n    ")
    end

    def frontend_index_path
      candidates = [
        Rails.root.join("public", "index.html"),
        Rails.root.join("..", "frontend", "dist", "index.html")
      ]
      candidates.map(&:to_s).find { |p| File.exist?(p) } || ""
    end

    def service
      @service ||= Service.find(params[:id])
    end

    def service_params
      params.require(:service).permit(:service_date, :label, :sermon_title, :sermon_reference)
    end
  end
end
