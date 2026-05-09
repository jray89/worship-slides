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
      base = frontend_base_url
      url = "#{base}/print/#{service.id}/slides?token=#{export_token}"
      pdf = Grover.new(url,
        viewport: { width: 1920, height: 1080 },
        width: "1920px",
        height: "1080px",
        print_background: true,
        wait_until: "domcontentloaded",
        wait_for_selector: "#print-ready"
      ).to_pdf

      send_data pdf,
        filename: "#{service.service_date}-slides.pdf",
        type: "application/pdf",
        disposition: "attachment"
    end

    def export_title_card
      base = frontend_base_url
      url = "#{base}/print/#{service.id}/title_card?token=#{export_token}"
      png = Grover.new(url,
        type: "png",
        viewport: { width: 1920, height: 1080 },
        full_page: false,
        omit_background: true,
        wait_until: "domcontentloaded",
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

    def frontend_base_url
      ENV.fetch("FRONTEND_URL") { Rails.env.development? ? "http://localhost:5174" : request.base_url }
    end

    def export_token
      JwtService.encode({ user_id: current_user.id }, exp: 5.minutes.from_now)
    end

    def service
      @service ||= Service.find(params[:id])
    end

    def service_params
      params.require(:service).permit(:service_date, :label, :sermon_title, :sermon_reference)
    end
  end
end
