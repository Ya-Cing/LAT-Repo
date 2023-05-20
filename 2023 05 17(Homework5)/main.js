$(document).ready(function(){
    //do something
    $("#thisButton").click(function(){
        processImage();
    });
    $("#inputImageFile").change(function(e){
        processImageFile(e.target.files[0]);
    });
});

function processImage() {
    var sourceImageUrl = document.getElementById("inputImage").value;
    if (sourceImageUrl) {
        processImageUrl(sourceImageUrl);
    } else {
        var imageObject = document.getElementById("inputImageFile").files[0];
        processImageFile(imageObject);
    }
}

function processImageUrl(imageUrl) {
    //確認區域與所選擇的相同或使用客製化端點網址
    var url = "https://eastus.api.cognitive.microsoft.com/";
    var uriBase = url + "vision/v3.2/analyze";
    
    var params = {
        "visualFeatures": "Tags,Brands,Description",
        "details": "",
        "language": "en",
    };
    //顯示分析的圖片
    document.querySelector("#sourceImage").src = imageUrl;
    //送出分析
    $.ajax({
        url: uriBase + "?" + $.param(params),
        // Request header
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        type: "POST",
        // Request body
        data: '{"url": "' + imageUrl + '"}',
    })
    .done(function(data) {
        //顯示JSON內容
        $("#responseTextArea").val(JSON.stringify(data, null, 2));
        $("#picDescription").empty();
        
        var tagResults = data.tags;
        var brandResults = data.brands;
        
        var resultText = "";
        if (tagResults && tagResults.length > 0) {
            resultText += "標籤：<br>";
            for (var i = 0; i < tagResults.length; i++) {
                resultText += (i + 1) + ". " + tagResults[i].name + "<br>";
            }
            resultText += "<br>";
        } else {
            resultText = "未能辨識到標籤。<br><br>";
        }
        
        if (brandResults && brandResults.length > 0) {
            resultText += "品牌：" + brandResults[0].name + "<br>";
            
            if (brandResults[0].brandsite) {
                resultText += "品牌官網：" + brandResults[0].brandsite + "<br>";
            }
            
            if (brandResults[0].country) {
                resultText += "發源地：" + brandResults[0].country + "<br>";
            }
        } else {
            resultText += "未能辨識到品牌。<br>";
        }
        
        var descriptionText = "";
        if (data.description && data.description.captions.length > 0) {
            descriptionText = "圖片描述：" + data.description.captions[0].text;
        }
        
        $("#picDescription").append(resultText + "<br>" + descriptionText);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        //丟出錯誤訊息
        var errorString = (errorThrown === "") ? "錯誤。" : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
    });
}

function processImageFile(imageObject) {
    //確認區域與所選擇的相同或使用客製化端點網址
    var url = "https://eastus.api.cognitive.microsoft.com/";
    var uriBase = url + "vision/v3.2/analyze";
    
    var params = {
        "visualFeatures": "Tags,Brands,Description",
        "details": "",
        "language": "en",
    };
    //顯示分析的圖片
    var sourceImageUrl = URL.createObjectURL(imageObject);
    document.querySelector("#sourceImage").src = sourceImageUrl;
    //送出分析
    $.ajax({
        url: uriBase + "?" + $.param(params),
        // Request header
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        type: "POST",
        processData: false,
        contentType: false,
        // Request body
        data: imageObject,
    })
    .done(function(data) {
        //顯示JSON內容
        $("#responseTextArea").val(JSON.stringify(data, null, 2));
        $("#picDescription").empty();
        
        var tagResults = data.tags;
        var brandResults = data.brands;
        
        var resultText = "";
        if (tagResults && tagResults.length > 0) {
            resultText += "標籤：<br>";
            for (var i = 0; i < tagResults.length; i++) {
                resultText += (i + 1) + ". " + tagResults[i].name + "<br>";
            }
            resultText += "<br>";
        } else {
            resultText = "未能辨識到標籤。<br><br>";
        }
        
        if (brandResults && brandResults.length > 0) {
            resultText += "品牌：" + brandResults[0].name + "<br>";

            }
        else {
            resultText += "未能辨識到品牌。<br>";
        }
        
        var descriptionText = "";
        if (data.description && data.description.captions.length > 0) {
            descriptionText = "圖片描述：" + data.description.captions[0].text;
        }
        
        $("#picDescription").append(resultText + "<br>" + descriptionText);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        //丟出錯誤訊息
        var errorString = (errorThrown === "") ? "錯誤。" : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
    });
}