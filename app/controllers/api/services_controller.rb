module Api
  class ServicesController < ApplicationController
    skip_before_action :verify_authenticity_token, only: [ :create, :update, :destroy ]

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
      url = "#{request.base_url}/print/#{service.id}/slides"
      pdf = Grover.new(url,
        viewport: { width: 1456, height: 816 },
        prefer_css_page_size: true,
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
      url = "#{request.base_url}/print/#{service.id}/title_card"
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

    def service
      @service ||= Service.find(params[:id])
    end

    def service_params
      params.require(:service).permit(:service_date, :label, :sermon_title, :sermon_reference)
    end
  end
end
