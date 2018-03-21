(function(cwApi, $) {
  "use strict";

    cwApi.cwLayoutsEngine.basicAlertTemplate = {
        "MailTemplate": {
            "Title": "<h1> Notifications sur vos objets favoris: </h1>",
            "ObjectType": {
                "title": "<h2> MetaObject : {NAME} </h2>",
                "end": "",
                "properties": []
            },
            "Object": {
                "title": "<h3> Object : {NAME} </h3>",
                "end": "",
                "properties": ["Last modification date : {WHENUPDATED}", "Modified by : {WHOUPDATED}"]
            },
            "CODEID": {
                "11": {
                    "title": "<h4> New Items</h4>",
                    "templateMail": "<a target='_blank' href='{param2}'>{param1}</a>, ",
                    "end": "",
                    "description": "{param1} has been created"
                },
                "12": {
                    "title": "<h4> Deleted Items</h4>",
                    "templateMail": "{param1}, ",
                    "end": "",
                    "description": "{param1} has been deleted"
                },
                "21": {
                    "title": "<h4> Updated properties : </h4><table><tr><th>Property</th><th>Previous value</th><th>Current value</th></tr>",
                    "templateMail": "<tr><td>{param1}</td><td>{param2}</td><td>{param3}</td></tr>",
                    "end": "</table>",
                    "description": "Property {param1} Updated from {param2} to {param3}"
                },
                "22": {
                    "title": "<h4> New Associations : </h4><table><tr><th>Associations</th><th>Target Object</th><th>ObjectType</th></tr>",
                    "templateMail": "<tr><td>{param3}</td><td>{param1}</td><td>{param2}</td></tr>",
                    "end": "</table>",
                    "description": "New Association with {param1} {param2} ({param3})"
                },
                "23": {
                    "title": "<h4> Deleted Associations : </h4><table><tr><th>Associations</th><th>Target Object</th><th>ObjectType</th></tr>",
                    "templateMail": "<tr><td>{param3}</td><td>{param1}</td><td>{param2}</td></tr>",
                    "end": "</table>",
                    "description": "Deleted Association with {param1} {param2} ({param3})"
                },
            }
        }
    };

    cwApi.cwLayoutsEngine.basicAlertTemplate.header = "" + 
    "        <!DOCTYPE html>                                                                                           "+                                                              
    "        <html lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\">                                                 "+                                                                                                 
    "        <head>                                                                                                    "+                                    
    "            <meta charset=\"utf-8\" />                                                                            "+                                                                      
    "            <meta name=\"application-name\" content=\"http://localhost/evolve/sites/nokia/index.html?#\" />       "+                                                                                                                                           
    "            <title>Nouvelle notification</title>                                                                  "+                                                                                
    "            <style>                                                                                               "+                                                   
    "                ##{css}                                                                                           "+                                                       
    "            </style>                                                                                              "+                                                    
    "        </head>                                                                                                   "+                                     
    "        <body>                                                                                                    "+                                    
    "            ##{email}                                                                                             "+                                                     
    "        </body>                                                                                                   "+                                     
    "    </html>                                                                                                       ";                                 
                                                                                                                                           
    cwApi.cwLayoutsEngine.basicAlertTemplate.CSS = "" +                                                                                                                                        
    "       body {                                                                                                    "+                                     
    "           background-color: #EEEEEE;                                                                            "+                                                                      
    "       }                                                                                                         "+                                                  
    "       h1 {                                                                                                      "+                                  
    "           font-size: 22px;                                                                                      "+                   
    "           color: #0277bd;                                                                                       "+                 
    "       }                                                                                                         "+
    "       h2 {                                                                                                      "+
    "           font-size: 18px;                                                                                      "+                  
    "           color: #0277bd;                                                                                       "+                 
    "       }                                                                                                         "+                                                                                   
    "       h3 {                                                                                                      "+
    "           font-size: 16px;                                                                                      "+                  
    "           color: #0277bd;                                                                                       "+                 
    "       }                                                                                                         "+                                                                          
    "       h4 {                                                                                                      "+
    "           font-size: 14px;                                                                                      "+                  
    "           color: #0277bd;                                                                                       "+                 
    "       }                                                                                                         "+                                                                                             
    "       table, th, td {                                                                                           "+             
    "          border: 1px solid #0277bd;                                                                             "+                           
    "           white-space: nowrap;                                                                                  "+                      
    "       }                                                                                                         "+                                                                               
    "       .header-handle {                                                                                          "+              
    "           width: 5px !important;                                                                                "+                        
    "           background-color: #99c4e0;                                                                            "+                            
    "       }                                                                                                         "+                                                                                         
    "       .header-item {                                                                                            "+             
    "           padding-left: 5px !important;                                                                         "+                                
    "           background-color: #d4e6f2;                                                                            "+                             
    "       }                                                                                                         "+                                                                               
    "       #subject {                                                                                                "+         
    "           font-weight: bold;                                                                                    "+                     
    "           line-height: 18px;                                                                                    "+                     
    "       }                                                                                                         "+         
    "       .link {                                                                                                   "+
    "           color: #70706f;                                                                                       "+                 
    "       }                                                                                                         "+                                                                                               
    "       #content {                                                                                                "+                      
    "           padding: 10px;                                                                                        "+                
    "           border-bottom: 1px solid #d4e6f2;                                                                     "+                                  
    "       }                                                                                                         "+                                                                                    
    "       #footer {                                                                                                 "+        
    "           font-size: 10px;                                                                                      "+                  
    "           text-align: center;                                                                                   "+                     
    "           font-weight: bold;                                                                                    "+                    
    "           padding: 5px;                                                                                         "+               
    "           color: #8a8a88;                                                                                       "+                 
    "           height: 20px;                                                                                         "+               
    "       } " ;
}(cwAPI));