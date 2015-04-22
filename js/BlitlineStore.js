function BlitlineStore() {
    riot.observable(this)

    var self = this;
    // Set your own App ID;
    self.myAppId = "4LtTjNqXfv7wzGsJp-hp16Q";
    // Create Blitline Object
    self.blitline = new Blitline();
    self.on('transformsubmit', function(imageurl, imagename, functionname, functionamount) {
        var d = new Date();
        // Build your JSON
        var json;
        if (functionname == "quantize"){
            json = {
                "application_id": self.myAppId,
                "src": imageurl,
                "functions": [{
                    "name": functionname,
                    "params": {"number_colors": functionamount},
                    "save": {"image_identifier": imagename,
                        "s3_destination" : {
                            "bucket" : "amp-blit-test",
                            "key" : d.getTime()+imagename
                        }}
                }
                ]
            };
        }
        else if (functionname == "blur"){
            json = {
                "application_id": self.myAppId,
                "src": imageurl,
                "functions": [{
                    "name": functionname,
                    "params":{"sigma":functionamount},
                    "save": {"image_identifier": imagename,
                        "s3_destination" : {
                            "bucket" : "amp-blit-test",
                            "key" : d.getTime()+imagename
                        }}
                }
                ]
            };
        }
        var events = {
            completed : function(results, error) {
                self.blitlineimages = results[0].images[0];//0 is listed here presumably because an array of transformations, for this example we're doing one at a time
                self.blitlineimages.originalurl = imageurl;
                RiotControl.trigger('transformdone',self.blitlineimages);
            }
        }
        self.blitline.submit(JSON.stringify(json), events);

    });

    self.on('extractsubmit', function(imageurl, maxcolors) {
        // Build your JSON
        var json = {
                "application_id": self.myAppId,
                "src": imageurl,
                "extract_colors": {
                "max_colors": maxcolors
                },
                "functions": [{
                    "name": "no_op",
                    "params": {}
                }
                ]
            };
        var events = {
            completed : function(results, error) {
                self.blitlineimages = results[0].original_meta.extracted_colors;//0 is listed here presumably because an array of transformations, for this example we're doing one at a time
                RiotControl.trigger('extractdone',self.blitlineimages);
            }
        }
        self.blitline.submit(JSON.stringify(json), events);
    });

    self.on('blitshotsubmit', function(pageurl) {
        var d = new Date();
        var json = {
            "application_id": self.myAppId,
            "src": pageurl,
            "src_type" : "screen_shot_url",
            "src_data":{
                "viewport":"1200x800",
                "delay":5000
            },
            "functions": [{
                "name": "resize_to_fit",
                "params": {"width":600},
                "save": {"image_identifier": "blitshot.png",
                    "s3_destination" : {
                        "bucket" : "amp-blit-test",
                        "key" : d.getTime()+"blitshot.png"
                    }}
            }
            ]
        };
        var events = {
            completed : function(results, error) {
                self.blitlineimages = results[0].images[0];
                RiotControl.trigger('blitshotdone',self.blitlineimages);
            }
        }
        self.blitline.submit(JSON.stringify(json), events);
    });
    self.on('compositesubmit', function(baseurl, layer1url) {
        var d = new Date();
        var json = {
            "application_id": self.myAppId,
            "src": baseurl,
            "functions": [{
                "name": "composite",
                "params": {"src":layer1url},
                "save": {"image_identifier": "composite.png",
                    "s3_destination" : {
                        "bucket" : "amp-blit-test",
                        "key" : d.getTime()+"composite.png"
                    }}
            }
            ]
        };
        var events = {
            completed : function(results, error) {
                self.blitlineimages = results[0].images[0];
                RiotControl.trigger('compositedone',self.blitlineimages);
            }
        }
        self.blitline.submit(JSON.stringify(json), events);
    });
    self.on('scriptsubmit', function(scripturl, image1url) {

        var d = new Date();
        var json = {
            "application_id": self.myAppId,
            "src": image1url,
            "functions": [{
                "name": "script",
                "params": {"files":scripturl,
                            "executable":"cylinderize.sh -m vertical -v background -b none -p 20 -t input.png output.png"},
                "save": {"image_identifier": "script.png",
                    "s3_destination" : {
                        "bucket" : "amp-blit-test",
                        "key" : d.getTime()+"script.png"
                    }}
            }
            ]
        };
        var events = {
            completed : function(results, error) {
                self.blitlineimages = results[0].images[0];
                RiotControl.trigger('scriptdone',self.blitlineimages);
            }
        }
        self.blitline.submit(JSON.stringify(json), events);
    });
    self.on('transforminit', function() {
        self.imageurl = 'https://s3.amazonaws.com/amp-blit-test/duck.png';
        self.imagename = 'ducktransform.png';
        self.functionamount = 8;
        self.maxcolors = 8;
        RiotControl.trigger('transforminitialized',self.imageurl,self.imagename, self.functionamount, self.maxcolors);
    });
    self.on('extractinit',function(){
        self.extractimageurl = 'https://s3.amazonaws.com/amp-blit-test/duck.png';
        self.maxcolors = 8;
        RiotControl.trigger('extractinitialized',self.extractimageurl, self.maxcolors);
    });
    self.on('blitshotinit',function(){
        self.pageurl = 'http://www.merchify.com/';
        RiotControl.trigger('blitshotinitialized',self.pageurl);
    });
    self.on('compositeinit',function(){
        self.baseurl = 'https://s3.amazonaws.com/amp-blit-test/background.png';
        self.layer1url = 'https://s3.amazonaws.com/amp-blit-test/layer1.png';
        self.layer2url = 'https://s3.amazonaws.com/amp-blit-test/layer2.png';
        RiotControl.trigger('compositeinitialized',self.baseurl, self.layer1url, self.layer2url);
    });
    self.on('scriptinit',function(){
        self.scripturl = 'https://s3.amazonaws.com/amp-blit-test/cylinderize.sh';
        self.image1url = 'https://s3.amazonaws.com/amp-blit-test/duck.png';
        RiotControl.trigger('scriptinitialized',self.scripturl, self.image1url);
    });
}
