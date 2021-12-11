
(function(){  
    const {ipcRenderer} = nodeRequire('electron')

    function isInDay(arg, base) {
        let startDate = new Date(Date.UTC(base.getFullYear(), base.getUTCMonth(), base.getUTCDate()));        
        let endDate = new Date(Date.UTC(base.getFullYear(), base.getUTCMonth(), base.getUTCDate() + 1));
        //console.log(startDate, base,  endDate);
        if (arg >= startDate && arg < endDate)
            return true;
        return false;
    }
    function formatDate(date,displaytime) {
        date=(date===undefined)?"":date;
        displaytime=(displaytime===undefined)?false:displaytime;
      if (date == '' || date == null){
            date = new Date();
        } else {
            date = new Date(date);	
        }
      if (isInDay(date, new Date(Date.now())))
        return "Today";
        
      var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];
      var weekNames = [
          "Sunday", "Moneday", "Tuesday",
          "Wednesday", "Thursday", "Friday",
          "Saturday"
      ];
    
      var dd = date.getDate().toString();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();
      var day = date.getDay();
      
      var hh = date.getHours().toString();
      var mm = date.getMinutes().toString();
      var ss = date.getSeconds().toString();
      
      var ddChars = dd.split('');
      var hhChars = hh.split('');
      var mmChars = mm.split('');
      var ssChars = ss.split('');
      if (displaytime==false){
        return weekNames[day] + ", " + monthNames[monthIndex] + ' ' + (ddChars[1]?dd:"0"+ddChars[0]) + ', ' + year;		
      }
      return monthNames[monthIndex] + ' ' + (ddChars[1]?dd:"0"+ ddChars[0]) + ', ' + year+ ' '+(hhChars[1]?hh:"0"+hhChars[0])+':'+(mmChars[1]?mm:"0"+mmChars[0])+':'+(ssChars[1]?ss:"0"+ssChars[0]);
    }

    function showHistoryPage (data) {
        let i;
        let history = data.history;
        let favicons = data.favicons;
        let groupDate =  null;
        let strPage = ''
        $(".history-page").text("");
        for( i = 0; i < history.length; i ++) {
            let item = history[i];
            let url = item.url.replace(/\/$/, '');
            let iconUrl = 'https://app.lagatos.com/favicon.ico';
            if (favicons[url])
                iconUrl = favicons[url];
            else if(favicons[item.url])
                iconUrl = favicons[item.url];
            
            let timestamp = new Date(item.timestamp);
            if (groupDate == null || !isInDay(timestamp, groupDate))
            {
                if (strPage)
                    strPage += '</ul>';
                strPage += `<h5>${formatDate(timestamp)}</h5>`;
                strPage += '<ul class="list-group">';
                groupDate = timestamp;
            }
            strPage += `<li class="list-group-item" data-url="${url}"><img src="${iconUrl}"/><Label>${item.title}</Label>${item.host || item.pathname.replace(/^\/\//, "")}</li>`;
        }
        strPage += '</ul>';
        $(".history-page").append(strPage);
    }
    $(document).ready(() => {
        ipcRenderer.send('getbrowserhistory', { keyword: ""});
        ipcRenderer.on('browserhistory', (event, data) => {
            showHistoryPage(data);
            console.log(data);
        })
        ipcRenderer.on('emptybrowserhistory', (event, data) => {
            showHistoryPage({history: [], favicons: []});
        })
        $(".history-page").on('click', '.list-group-item', function(e) {
            let url = $(e.currentTarget).attr("data-url");
            ipcRenderer.send('opennewtab', { url: url });
        })
        $("#searchform").on('submit', (e) => {
            e.preventDefault(true)
            var keyword = $("#keyword").val();            
            ipcRenderer.send('getbrowserhistory', { keyword: keyword});
        })
        $("#btn-DelCookies").click(() => {
            ipcRenderer.send('cleareCookies', true);

        })
        $("#btn-DelHistory").click(() => {            
            ipcRenderer.send('clearbrowserhistory', true);
        })
    })
  })();