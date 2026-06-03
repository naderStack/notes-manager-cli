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

export function json2sql (rows,tableName){

    if (!rows.length) return ''; // check parma is not empty 

    // get keys from first object  : string 

    const cols = Object.keys(rows[0]).join(',');

    const values = rows.map( row => {

        const vals = Object.values(row).map(val => 
            typeof val === 'string' ? `'${val.replace(/'/g,"''")}'` : val 
        ).join(', ');

        return `(${vals})`;

     
    }).join(',\n');

    
    return `INSERT INTO ${tableName} (${cols}) VALUES \n${values};\n`;
}