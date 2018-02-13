(function() {
  let BioToggles, externalLinks;

  // Toggle full or summary bio
  BioToggles = function() {
    let $toggles;
    $toggles = $('[data-bio]');
    return $toggles.click(function() {
      let $bio, $full, $summary;
      $bio = $(this).data("bio");
      $full = $('#bio-full');
      $summary = $('#bio-summary');
      switch ($bio) {
        case "full":
          $full.show();
          $summary.hide();
          $toggles.addClass("link");
          return $(this).removeClass("link");
        case "summary":
          $summary.show();
          $full.hide();
          $toggles.addClass("link");
          return $('[data-bio="summary"]').removeClass("link");
      }
    });
  };

  // Open external links in a new tab
  externalLinks = function() {
    $(document.links).filter(function() {
      return this.hostname != window.location.hostname;
    }).attr('target', '_blank');
  }

  // init functions
  $(function() {
    BioToggles();
    externalLinks();
  });

}).call(this);
