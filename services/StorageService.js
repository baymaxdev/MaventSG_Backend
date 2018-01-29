var knox = require('knox');
var Config = require('../components/configs');

module.exports = {
  
       imageUpload : function(options) {
         
         (options.file).upload({
         dirname : '/' + options.folder_type + '/' + options.file_id + "/",
         maxBytes : 20000000,
         adapter: require('skipper-s3'),
         key: Config.AWS_S3.AWS_S3_KEY,
         secret: Config.AWS_S3.AWS_S3_SECRET,
         bucket: Config.AWS_S3.AWS_S3_BUCKET
       }, function (err, filesUploaded) {

         if(err) {
              return options.callback(err.message,null);
         } 
         else
         {  
             return options.callback(null,filesUploaded);
         }
       });
},

deleteImage : function(options){          

    var obj = options.delete_img_url.split('/');
    var img_url = obj[3] +'/' + obj[4] +'/' +obj[5];
    // console.log(img_url);

    var client = knox.createClient({
         key: Config.AWS_S3.AWS_S3_KEY,
         secret: Config.AWS_S3.AWS_S3_SECRET,
         bucket: Config.AWS_S3.AWS_S3_BUCKET
      });
        client.del(img_url).on('response', function(err){
          
         if(err) {
            return options.callback(err.message,null);
         } 
         else
         {  
            return options.callback(null,"succesfully deleted");
         }
        }).end();
      }
};