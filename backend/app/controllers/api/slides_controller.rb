module Api
  class SlidesController < BaseController
    def index
      render json: service.slides.order(:position)
    end

    def create
      slide = service.slides.build(slide_params)

      # Fetch content for psalm/scripture slides
      case slide.slide_type
      when "psalm"
        slide.content_data = fetch_psalm_content(slide)
      when "scripture", "key_verse"
        slide.content_data = fetch_scripture_content(slide)
      end

      if slide.save
        render json: slide, status: :created
      else
        render json: { errors: slide.errors.full_messages }, status: :unprocessable_entity
      end
    rescue => e
      render json: { error: e.message }, status: :unprocessable_entity
    end

    def update
      slide = service.slides.find(params[:id])
      if slide.update(slide_params)
        render json: slide
      else
        render json: { errors: slide.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      service.slides.find(params[:id]).destroy
      head :no_content
    end

    def move
      slide = service.slides.find(params[:id])
      if params[:direction] == "up"
        slide.move_higher
      else
        slide.move_lower
      end
      head :ok
    end

    private

    def service
      @service ||= Service.find(params[:service_id])
    end

    def slide_params
      params.require(:slide).permit(
        :slide_type, :psalm_number, :verse_start, :verse_end,
        :psalm_version, :scripture_reference
      )
    end

    def fetch_psalm_content(slide)
      scraper = PsalmScraper.new
      all_data = scraper.fetch(slide.psalm_number)

      version = slide.psalm_version || "first"
      stanzas = all_data[version] || all_data["first"] || []

      # Filter stanzas to the requested verse range
      if slide.verse_start && slide.verse_end
        stanzas = filter_stanzas_by_verses(stanzas, slide.verse_start, slide.verse_end)
      end

      { "stanzas" => stanzas, "version" => version }
    end

    def filter_stanzas_by_verses(stanzas, verse_start, verse_end)
      # Walk stanzas in order, tracking the "current verse" as we go.
      # A stanza with no verse_numbers inherits the current verse context.
      in_range = false
      current_verse = 0
      result = []

      stanzas.each do |stanza|
        # verse_numbers is a hash {line_index => verse_number}; extract just the numbers
        raw = stanza["verse_numbers"] || {}
        verse_nums = raw.is_a?(Hash) ? raw.values : Array(raw)

        if verse_nums.any?
          current_verse = verse_nums.max

          in_range = true  if verse_nums.any? { |v| v >= verse_start }
          in_range = false if verse_nums.min > verse_end
        end
        # Stanzas with no verse_numbers (continuation) inherit in_range

        result << stanza if in_range
      end

      result
    end

    def fetch_scripture_content(slide)
      scraper = ScriptureScraper.new
      data = scraper.fetch(slide.scripture_reference)

      # For scripture reading, pre-paginate the text
      if slide.slide_type == "scripture"
        renderer = SlideRenderer.new
        pages = renderer.send(:paginate_text, data["full_text"])
        data["pages"] = pages
      end

      data
    end
  end
end
