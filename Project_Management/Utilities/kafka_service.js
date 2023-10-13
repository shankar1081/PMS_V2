
// var kafka = require('kafka-node'),
//    Producer = kafka.Producer,
//     client = new kafka.KafkaClient(),
//     producer = new Producer(client);
//     Consumer = kafka.Consumer,
//     consumer = new Consumer(
//       client,
//       [
//           { topic: 'readPDF', partition: 0 }
//       ],
//       {
//           autoCommit: false
//       }
//   )
//  async function sendToProducer(topic,message,cb){
//     payloads = [
//       { topic: topic, messages: message, partition: 0 },
   
//   ]  
//  // Producing

 
//   producer.send(payloads, function (err, data) {
    
//     if(err){
//       console.log(err)
//     }
//     else{
//       consumer.on('message', function (message) {
//         console.log("some message"+message.value.includes("pdf_success"))
//         if(message.value.includes("pdf_success")){
//          return cb(message)
//         }
//     })
    
     
//     }
   
//   });


    
    
//   }
// //   consumer.connect().then(()=>{
            
// //     consumer.subscribe({ topic: "readFile", fromBeginning: true }).then(res=>{
// //         consumer.run({
// //             eachMessage: async ({ topic, partition, message }) => {
// //               console.log({
// //                 partition,
// //                 offset: message.offset,
// //                 value: message.value.toString(),
// //               })
// //              return resolve(message.value.toString());
// //             },
// //           }).then(result=>{
           
// //           })
// //     }).catch(err=>{
// //         return reject(err)
// //     })
// // })
//   //consumers
 

//   exports.sendToProducer = sendToProducer;
 
  