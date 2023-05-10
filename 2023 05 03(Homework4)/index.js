'use strict';
const line = require('@line/bot-sdk'),
      express = require('express'),
      configGet = require('config');
const {TextAnalyticsClient, AzureKeyCredential} = require("@azure/ai-text-analytics");

//Line config
const configLine = {
  channelAccessToken:configGet.get('CHANNEL_ACCESS_TOKEN'),
  channelSecret:configGet.get('CHANNEL_SECRET')
};




//Azure Text Sentiment
const endpoint = configGet.get("ENDPOINT");
const apiKey = configGet.get("TEXT_ANALYTICS_API_KEY");

const client = new line.Client(configLine);
const app = express();

const port = process.env.PORT || process.env.port || 3001;

app.listen(port, ()=>{
  console.log(`listening on ${port}`);
});
  


//async function MS_TextSentimentAnalysis(thisEvent){
//    console.log("[MS_TextSentimentAnalysis] in");
//    const analyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));
//    let documents = [];
//    documents.push(thisEvent.message.text);
//    const results =await analyticsClient.analyzeSentiment(documents,"zh-Hant",{        includeOpinionMining: true    });
//    console.log("[results] ", JSON.stringify(results));
  //  documents.push("我覺得櫃檯人員很親切");

//改成中文回覆
async function MS_TextSentimentAnalysis(thisEvent){
  console.log("[MS_TextSentimentAnalysis] in");
  const analyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));
  let documents = [];
  documents.push(thisEvent.message.text);
  const results = await analyticsClient.analyzeSentiment(documents,"zh-Hant",{ includeOpinionMining: true });
  console.log("[results] ", JSON.stringify(results));

//加入回覆句
  let replyMessage;
  switch(results[0].sentiment){
    case "positive":
      replyMessage = "正向。\n感謝您的肯定，希望您再度光臨！";
      break;
    case "negative":
      replyMessage = "負向。\n很抱歉讓您感到不愉快，請問有什麼我們可以改善的嗎？";
      break;
    default:
      replyMessage = "中性。\n謝謝您的訊息，祝您有美好的一天！";
      break;
  }

  // Add sentiment score to reply message
  replyMessage += `\n分數: ${results[0].confidenceScores[results[0].sentiment]}`

  const echo = {
    type: 'text',
    text: replyMessage
  };
  return client.replyMessage(thisEvent.replyToken, echo);
}


//const echo={
//  type:'text',
//  text: results[0].sentiment
//};
//return client.replyMessage(thisEvent.replyToken, echo);
//}


app.post('/callback',line.middleware(configLine),(req,res)=>{
  Promise
  .all(req.body.events.map(handleEvent))
    .then((result)=>res.json(result))
    .catch((err)=>{
      console.error(err);
      res.status(500).end();
    });
  });

function handleEvent(event){
  if(event.type!=='message'||event.message.type!=='text'){
    return Promise.resolve(null);
  }
  MS_TextSentimentAnalysis(event)
  .catch((err)=>{
    console.error("Error:",err);
  });  
}