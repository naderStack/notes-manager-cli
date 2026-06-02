 export function convertTocsv(json){
       let body = "";
   
   let head = '' ;
   // get header string 
   Object.keys(json[0]).forEach( h => {
   head += h+","
   })
   
   // convert to array 
   head = head.split(",")
   
   // remove last item 
   head.pop()
   
   // head [ id , name ]
   // json [ {id,name } , {id , name}]
   json.forEach(k => {
      head.forEach(v => {
           body += k[v] + ","
      })
      body += "\n"
   })
   
   // head.forEach(element => {
   //         body += json[element] + ","
   // });
   
   head = head.join(",") // [header body ] string 
   
   head += "\n" // [header body ] + new line 
   
   body = body.slice(0,-1) // remove [,] in last string 
   
   body += "\n"  // [body body ] + new line 
   
   
   let csv = "";
   
   csv = head + body 
   
   // console.log(csv)
   // // console.log(head)
   // console.log(typeof csv)
   
   
   // json.forEach(element => {
   //         head +=`\n\"${element.id}\",\"${element.firstName}\",\"${element.lastName}\",\"${element.email}\",\"${element.phone}\",\"${element.dateOfBirth}\",\"${element.gender}\",\"${element.gender}\",\"${element.major}\",\"${element.isActive}\",`
   // });
   
       return csv
   }

// json 

export function convertToJson(rows) {

        return JSON.stringify(rows, null, 2)

}