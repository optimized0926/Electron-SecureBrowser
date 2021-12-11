(function(){  
    const Unsplash = nodeRequire('unsplash-js').default;
    const toJson = nodeRequire('unsplash-js').toJson;
    const fetch = nodeRequire('node-fetch');
    let images = [];
    let index = 0;
    const TIMEOUT = 18000;
    global.fetch = fetch;
    const {getEnvVar} = nodeRequire('./app/env');
    var config = {
        accessKey: getEnvVar("unsplash_access"),
        secret: getEnvVar("unsplash_secret"),
    };
    const unsplash = new Unsplash(config);
    unsplash.photos.listPhotos(0, 15, "latest")
    .then(toJson)
    .then(json => {
        // Your code
        console.log(json);
        images = json;
        startShowImage();
    }).catch(e => {
        console.log(e);
    });
    function startShowImage() {
        if (images.length == 0)
            return;
        const url = images[index].urls.regular;          
        document.body.style.backgroundImage = `url(${url})`;
        $(".unsplash-user img").attr("src", images[index].user.profile_image.medium);
        $(".unsplash-user span").text(`${images[index].user.name}`)
        $(".unsplash-user span").css('color', images[index].color)
        $(".unsplash-user a").attr("href", images[index].links.html);
        setTimeout(startShowImage, TIMEOUT);
        index ++;
        if (index >= images.length)
            index = 0;  
    }
})();