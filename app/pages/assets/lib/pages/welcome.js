
(function(){  
    const { remote } = nodeRequire('electron')
    const auth = remote.require('./auth')
    const {ipcRenderer} = nodeRequire('electron');
    ipcRenderer.on('signin', () => {
        showSignedInAlert();
    })
    ipcRenderer.on('will-showdemo', (event, show) => {
      if (show == true)
        insertDemoVideo();
    })
    ipcRenderer.send('check-showdemo', true)
    
    function insertDemoVideo() {
      let demoVideo = `
            <div class="video-wrapper">    
              <a href="javascript:;" class="loom-close" aria-label="close">&times;</a>
              <div style="position: relative; padding-bottom: 56.25%; height: 0;">
                  <iframe src="https://www.loom.com/embed/3b2b1eddd55d48e6879dc0c47dba5e3a" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                  </iframe>
              </div>
            </div>`;
      if ($("video-wrapper").length == 0)    
        $(demoVideo).insertAfter($("#browser-hint"));
        
      $(".loom-close").click(function() {
        $(".video-wrapper").remove();
      })
    }

    function showSignedInAlert() {
        var alertTag = `
        <div class="signin-alert">
          <div class="alert alert-success alert-dismissible">
            <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
            <div>Thank you for joining. You can now earn money. <br>
               Your personal invite link: <strong>lagatos.com/daio839q3743q87</strong></div>
            <div>Complete these steps, at app.lagatos.com</div>
            - Create your digital wallet<br>
            - Create your username<br>
            - Opt in to WhatsApps messages<br>
            - Opt in to SMS
          </div>
        </div>`;
        $(alertTag).insertAfter($("#earn-hint"));
    }
    $(document).ready(function() {      
    })
  })();