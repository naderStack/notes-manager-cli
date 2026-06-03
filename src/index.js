import { dirname, join } from 'path'

import url, { fileURLToPath } from 'url'

import {writeFile ,
        mkdirSync , 
        existsSync ,
         statSync 
        } from 'fs'

import chalk from 'chalk'

// import module sqlite 

import {DatabaseSync} from 'node:sqlite'

import Table from 'cli-table3'

let current_timestamp = Date.now(); 


// my module
import { convertTocsv, convertToJson, json2sql } from './functions.mjs'
import { table } from 'console'

let command = process.argv[2] // [ add , delete , list ]

 let  tag , value_tag , valueOption , sql 

// check if user type commands or not 

if (!command ){
    console.log(chalk.bgYellowBright('enter options'))
    process.exit(1)
}
// [debug ]

// console.log(import.meta.url) // file:///home/nader/Desktop/cli-notes-taker/src/index.js
// console.log(fileURLToPath(import.meta.url))     // /home/nader/Desktop/cli-notes-taker/src/index.js

let __dirname= dirname(fileURLToPath(import.meta.url))       // /home/nader/Desktop/cli-notes-taker/src

let db = new DatabaseSync(join(__dirname,'database.db'))

 db.exec(`create table if not exists notes (id  integer primary key autoincrement , name text , tags text , dateAt  timestamp default current_timestamp )`)

switch (command) {
    
    case 'add':
    case 'a':

        // add a Note when typing <name Note > and < tag Name> [require]
    
            valueOption   = process.argv[3]
            tag                 = process.argv[4] // [--tag]
            value_tag       = process.argv[5]  // [ value tag]

        if (valueOption && tag=='--tag' && value_tag) {

            value_tag  = value_tag.split(",")

            let stmt = db.prepare(`INSERT  INTO notes (name , tags ) VALUES (?,?)`)
        
           let state = stmt.run(valueOption ,  JSON.stringify( value_tag ))

        
           if (state.changes) {
                console.log(chalk.blueBright(`done ! add a note [${valueOption}]`))
           } 
            
        } else {
            console.log(chalk.yellow("type a tag for your note "))  // warning when add a note without tagname 
        }                   

    break;

case 'list':
case 'l':

    tag             = process.argv[3]

    value_tag   = process.argv[4]

        // show all Notes when dont use --tags

    if (!tag){
        

      try {
        
          let stmt = db.prepare(`SELECT * FROM   notes `)

        let data = stmt.all();

                const table = new Table({
                    head: ['ID', 'Name' , 'tags','create at'],
                    colWidths: [5, 30,20,30]
                });

            // console.log(data)

            data.forEach(row => {
                    table.push([ chalk.yellow(row.id), row.name , row.tags , chalk.blue(row.dateAt)]);
                });
                
           console.log(table.toString());

      } catch(err) {
       console.error('[DB ERROR]', err);
      }

    } 
        

        // show a note when type --tag <tagname> if it match [a note with tag ]
        if (tag == "--tag" && value_tag){

           //s

            try {
                    let stmt = db.prepare(`SELECT * FROM notes WHERE tags LIKE ? `)
                    let row = stmt.all(`%${value_tag}%` )

                    if (row.length == 0 ) {
                        console.log(chalk.blueBright(`Not found Notes include this [tag:${value_tag}]`))
                }else {
                      const tableTag = new Table({
                                        head: ['ID', 'Name' , 'tags','create at'],
                                        colWidths: [5, 40,30,30]
                                    });


                    row.forEach(r => {
                                            tableTag.push([ chalk.yellow(r.id), r.name , r.tags , chalk.blue(r.dateAt)]);
                                        });
            
    
                    console.log(tableTag.toString());
                }

                
            }catch(er){
                console.error(er)
            }
            //e
      


        }


      
     break;

   case 'delete':
    case 'd':
     valueOption = process.argv[3]
           if (valueOption){
                if (!isNaN(valueOption)) {

                //s
                try {
                    let stmt = db.prepare(`DELETE FROM notes WHERE id=?`)
                    let state = stmt.run(valueOption)
                
                
                    if (state.changes == 0) {
                                    console.log(chalk.bgYellowBright("The id is Not Found !"))
                            } else {
                            console.log(chalk.bgRed((`deleted ${state.changes} notes `)))

                            }

                }catch(err){
                        console.log(err)
                }

                //e
                            
                } else {
                    console.log(chalk.bgYellow("enter id look like 4 "))
                }
           } else {
            console.log(chalk.bgYellowBright(`enter number id of a note `))
           }
           
        break;

    case 'search':
    case 's':
            valueOption = process.argv[3]

            // s
                try {
                    let stmt = db.prepare(`SELECT * FROM notes WHERE name LIKE ?`)

                    let rows = stmt.all(`%${valueOption}%`)

                     if (rows.length == 0) {
                    console.log(chalk.bgYellowBright('not found !'))
                } else {
                    const tableTag = new Table({
                        head: ['Note' ],
                        colWidths: [ 50]
                    });
                    
                    rows.forEach(r => {
                        tableTag.push([ r.name  ]);
                        tableTag.push([ `${chalk.yellow(r.dateAt)}   [${chalk.blue(r.id)}]` ,]);
                        
                    });                   
                    
                    console.log(tableTag.toString());
                }

                }catch(err) {
                    console.log(chalk.bgRed(err))
                }
            // e   

              
    
    break;

    case "export":
    case "ex":

        valueOption = process.argv[3]
            let dirExport = 'exportResult'
            if (!existsSync(`./${dirExport}`)) {
                mkdirSync(`./${dirExport}`)
            }  

    if (valueOption && valueOption == "csv") {
        // s

        try {

            let stmt = db.prepare(`SELECT * FROM notes`)

            let rows = stmt.all()

              writeFile(`${dirExport}/${current_timestamp}.csv`, convertTocsv(rows),(err)=>{
                console.log(chalk.bgGreenBright(`done Export [ ${dirExport}/${current_timestamp}.csv ]`))
                })
            
        } catch(err) {
            console.error(err)
        }

        // e
     
    } else if(valueOption && valueOption == "json") {

        // s
                    try {
                let stmt = db.prepare(`SELECT * FROM notes`)
                let rows = stmt.all()

                    writeFile(`${dirExport}/${current_timestamp}.json`, convertToJson(rows), (err)=>{ 
                    console.log(chalk.bgGreenBright(`done Backup [ ${dirExport}/${current_timestamp}.json ]`)) 
                })

            }catch(err){
                console.log(err)
            }               
                } else {
        console.log(chalk.bgYellowBright("enter Type Export [csv,json] "))
    }
    // e
    break;
    case "backup":
        case "b":

                if (!existsSync('./bkup_db')) {
                mkdirSync("./bkup_db")
        }

        db.exec(`create table if not exists backups_log (
                id integer primary key autoincrement , 
                name integer ,
                    date timestamp default current_timestamp
            )`)
                

           //s1
                try {
                    let stmt = db.prepare(`SELECT * FROM notes`)

                    let rows = stmt.all()

                // create table
                // get all note 
                // add name [backup]
                //  get all backup
                // add new name [backup] & write file

                //s2
                        try {
                            let stmt2 = db.prepare(`SELECT * FROM backups_log ORDER BY id DESC LIMIT 1`)
                        let rows2 = stmt2.all()

                         let dayDiff =  current_timestamp - rows2[0].name ;

                                // 1000 * 60 * 60 * 24 == 1 day 
                                // yesterday  > today = false 
                               //
                                //1780348583942 > 1780348583942

                                // s3

                                 if ( dayDiff > 86400000) {               
                                 // store name file in database  
                                        try {
                                            let stmt3 = db.prepare(`INSERT INTO backups_log   (name) values (?)`).run(current_timestamp)
                                            
                                               // when stored name file 
                                    //   save file.csv when insert to database 

                                            if ( stmt3.changes === 1 ) {

                                                writeFile(`bkup_db/${current_timestamp}_bkup.csv`,
                                                    convertTocsv(rows),
                                                    (err)=>{
                                                            if (err) {
                                                                console.error('[ERROR]',{
                                                                    error: err
                                                                })
                                                            }
                                                        })      
                                            }

                                        }catch (er3) {
                                            console.error(er3)
                                        }
                                    } else {
                            console.log(chalk.bgBlackBright('you cannot do backup before 24h '))
                           }

                                // e3

                        }catch (err2){
                            console.error(err2)
                        }


                //e2


                }catch(err1) {
                console.log(err1)

                }
           //e1  
         
           break;

    case 'test':
        case 't':

      
   
        try {
            let stmt = db.prepare(`SELECT * FROM notes`)
                    let rows = stmt.run()
        }catch(err){
             
            console.error('[DB ERROR]',{
                sql:sql,
                error:err.name,
                messg:err.message
                
            })
        }

    

        try{
            let stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
            let rows = stmt.all()

            const tbls = rows.map(tbl => {
                        const table = Object.values(tbl)
                        return table 
            }).join(',').split(",")

              console.log(tbls)
        }catch (err){
            console.log(err)
        }
    


    break;

    default:
      console.log(chalk.bgYellowBright('a command not found'))
    break;
}
