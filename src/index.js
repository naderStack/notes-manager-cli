import { dirname, join } from 'path'

import url, { fileURLToPath } from 'url'

import {writeFile ,
        mkdirSync , 
        existsSync ,
         statSync 
        } from 'fs'

import chalk from 'chalk'

// import module sqlite 

import sqlite3 from 'sqlite3'

import Table from 'cli-table3'

let current_timestamp = Date.now(); 


// my module
import { convertTocsv, convertToJson } from './functions.mjs'

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

let db = new sqlite3.Database(join(__dirname,'database.db'))

 db.exec(`create table if not exists notes (id  integer primary key autoincrement , name text , tags text , dateAt  timestamp default current_timestamp )`)

switch (command) {
    
    case 'add':

        // add a Note when typing <name Note > and < tag Name> [require]
    
            valueOption   = process.argv[3]
            tag                 = process.argv[4] // [--tag]
            value_tag       = process.argv[5]  // [ value tag]

        if (valueOption && tag=='--tag' && value_tag) {

            value_tag  = value_tag.split(",")
        
            db.run( `insert into notes (name , tags ) values (?,?)`, [ valueOption ,  JSON.stringify( value_tag ) ]  )
            
        } else {
            console.log(chalk.yellow("type a tag for your note "))  // warning when add a note without tagname 
        }                   

    break;

case 'list':

    tag             = process.argv[3]

    value_tag   = process.argv[4]

        // show all Notes when dont use --tags

    if (!tag){
        

        db.all( `select * from notes`, [], (err, data) => {

                if (err) {
                    console.error(chalk.red(err));
                    return;
                }
                    
                const table = new Table({
                    head: ['ID', 'Name' , 'tags','create at'],
                    colWidths: [5, 30,20,30]
                });
                    
                data.forEach(row => {
                    table.push([ chalk.yellow(row.id), row.name , row.tags , chalk.blue(row.dateAt)]);
                });
                
           console.log(table.toString());
        
       })


    } 
        

        // show a note when type --tag <tagname> if it match [a note with tag ]
        if (tag == "--tag" && value_tag){

      
          db.all( `select * from notes where tags like ?`,[`%${value_tag}%`], (err,row)=>{

             const tableTag = new Table({
                        head: ['ID', 'Name' , 'tags','create at'],
                        colWidths: [5, 30,20,30]
                    });
                    
                    row.forEach(r => {
                        tableTag.push([ chalk.yellow(r.id), r.name , r.tags , chalk.blue(r.dateAt)]);
                    });
            
    
                    console.log(tableTag.toString());
          })

        }


      
     break;

   case 'delete':
     valueOption = process.argv[3]
           if (valueOption){
                if (!isNaN(valueOption)) {

                
                    db.run(`delete from notes where id=? ` , valueOption,function (err) {
                        if (err) {
                            console.log(err)
                        }
                        else {
                            if (this.changes == 0) {
                                    console.log(chalk.bgYellowBright("The id is Not Found !"))
                            } else {
                            console.log(chalk.bgRed((`deleted ${this.changes} notes `)))

                            }
                        }
                    })
                    
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
        
            db.all(`select * from notes where name like ?`,[`%${valueOption}%`],function (err , rows) {
                if (err) {
                    console.log(chalk.bgRed(err))
                }


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
            })

              
    
    break;

    case "export":
    case "ex":

        valueOption = process.argv[3]
            let dirExport = 'exportResult'
            if (!existsSync(`./${dirExport}`)) {
                mkdirSync(`./${dirExport}`)
            }  

    if (valueOption && valueOption == "csv") {

                db.all(`SELECT * FROM notes`,[],(err,rows) => {

                writeFile(`${dirExport}/${current_timestamp}.csv`,
            convertTocsv(rows),
            (err)=>{
                    if (err) {
                        console.error('[ERROR]',{
                            error: err
                        })
                    }

                    console.log(chalk.bgGreenBright(`done Backup [ ${dirExport}/${current_timestamp}.csv ]`))
                })
                
                
        }) // end select all [notes]

     
    } else if(valueOption && valueOption == "json") {
        // start 
                    db.all(`SELECT * FROM notes`,[],(err,rows) => {

                            // convertToJson(rows)

                        // console.log(convertToJson(rows))

                writeFile(`${dirExport}/${current_timestamp}.json`,
            convertToJson(rows),
            (err)=>{
                    if (err) {
                        console.error('[ERROR]',{
                            error: err
                        })
                    }

                    console.log(chalk.greenBright(`done Backup [ ${dirExport}/${current_timestamp}.json ]`))
                })
                
                
        }) // end 
    } else {
        console.log(chalk.bgYellowBright("enter Type Export [csv,json] "))
    }

    break;

    case "backup":
                if (!existsSync('./bkup_db')) {
                mkdirSync("./bkup_db")
        }

        db.exec(`create table if not exists backups_log (
                id integer primary key autoincrement , 
                name integer ,
                    date timestamp default current_timestamp
            )`)
                

           
                        
        db.all(`select * from notes ` , [],(err,rows)=>{

                if (err) {
                console.log(err)
                }
                // create table
                    // get all note 
                        // add name [backup]
                        //  get all backup
                                // add new name [backup] & write file
                            
                                db.all(`select * from backups_log ORDER by id DESC limit 1`,[],(err,log) =>{
                            if ( err) {
                                console.log(err)
                            }
                                
                                let dayDiff =  current_timestamp - log[0].name ;

                                // 1000 * 60 * 60 * 24 == 1 day 
                                // yesterday  > today = false 
                               //
                                //1780348583942 > 1780348583942

                           if ( true) {
                                console.log(dayDiff)
                           }
                    })

                
                // store name file in database  

                db.run(`insert into backups_log (name) values (?)`,
                    current_timestamp , 
                    function (err) {

                    if (err) {
                        console.error('[DB ERROR]',{
                            sql:sql 
                        })

                    }

                    // when stored name file 
                            //   save file.csv when insert to database 


                    // if (current_timestamp == )

                    if ( this.changes === 1 ) {

                        writeFile(`bkup_db/${current_timestamp}.csv`,
                            convertTocsv(rows),
                            (err)=>{
                                    if (err) {
                                        console.error('[ERROR]',{
                                            error: err
                                        })
                                    }
                                })      
                    }
                                        
            })

        }) 


    break;

    default:
      console.log(chalk.bgYellowBright('a command not found'))
    break;
}
