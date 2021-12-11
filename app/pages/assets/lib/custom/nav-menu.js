
(function(){  
  const { remote } = nodeRequire('electron')
  const auth = remote.require('./auth')
  const {ipcRenderer} = nodeRequire('electron');
  ipcRenderer.on('signin', () => {
    
  })
  let tooltip1 = null, tooltip2 = null;
  function startIntro(){

    if (!window.Tooltip) return;
    if (tooltip1 && tooltip2)
    {
      tooltip1.hide();
      tooltip2.hide();
      tooltip1.destroy();
      tooltip2.destroy();
      tooltip1 = tooltip2 = null;
      return;
    }
    tooltip1 = Tooltip.create(
    document.getElementById('browser-hint'),
      {
        'orientation': 'bottom',
        'text': 'Browse',
        'showOn': 'manual'
      }
    );          
    tooltip1.show();
    tooltip2 = Tooltip.create(
      document.getElementById('earn-hint'),
      {
        'orientation': 'top',
        'showOn': 'manual',
        'text': 'See your earnings now',
      }
    );
    tooltip2.show();
  }

  async function signout() {
    ipcRenderer.send('signout', true);
    const isSigned = await auth.isAuthenticated();
    if (isSigned)
    {
      await auth.logout();
      ipcRenderer.send('signout', true);
    }
  }

  function changeTheme() {
    ipcRenderer.send('changeTheme', true);
  }

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


  $(document).ready(function() {
    $(".circle-nav-menu").html(
      `<div class="dropdown nav-menu">
        <button type="button" class="btn btn-danger btn-circle btn-md  dropdown-toggle"  id="menu1" data-toggle="dropdown"><i class="fa fa-question"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-left" role="menu" aria-labelledby="menu1">
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;" id="btn-stepper">Get started</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;">Browsing History</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;" id="btn-demo">Demo Video</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;">Message Us</a></li>      
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;">hello@example.com(mailto link)</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;">Discord</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;">Linktree</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;" id="btn-theme">Dark Mode/Light Mode</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;">Toggle Off Unsplash</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;">Your Account(redirects to web application)</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;">Make Default Browser</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;">Version 2.0.0</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:;" id="btn-signout">Sign Out</a></li>
        </ul>
      </div>
      `
    )
    $("#btn-stepper").click(() => startIntro());
    $("#btn-signout").click(() => signout());
    $("#btn-theme").click(() => changeTheme());
    $("#btn-demo").click(() => insertDemoVideo());
  })
})();