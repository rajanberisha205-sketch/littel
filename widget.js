<script src="https://lite.fasqoo.com/widget.js"></script>
<div id="my-widget"></div>
<script>
  FasqooWidget.init({
    target: '#my-widget',
    width: 340,              // Zahl (px) oder '100%'
    height: 'auto',           // Zahl (px) oder 'auto'
    theme: 'dark',            // 'auto' | 'light' | 'dark'
    accent: '#3b82f6',        // jede Hex-Farbe
    autostart: true,
    showBranding: true,
    onComplete: function(result) {
      console.log('Fertig:', result);
      // result = { ping, jitter, download, upload }
    }
  });
</script>
