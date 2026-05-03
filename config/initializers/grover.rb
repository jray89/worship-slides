Grover.configure do |config|
  config.options = {
    format: "A4",
    viewport: {
      width: 1456,
      height: 816
    },
    prefer_css_page_size: true,
    print_background: true,
    wait_until: "networkidle0"
  }
end
