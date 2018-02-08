(function() {
  let BioToggles;

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

  $(function() {
    BioToggles();
  });

}).call(this);
