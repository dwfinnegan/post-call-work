# WxCC Post-Call-Work

This project creates a headless widget that automatically places an agent into an idle post-call-work state when the agent sets a Boolean CAD (call-associated data) variable to true before the interaction ends with the customer.  

Setting a global variable (aka CAD variable in agent desktop) as the trigger for when to place an agent into the after call work state allows for simplified reporting logic vs having the agent manually change the idle code, as it places the data direcly into the Customer Session Record (CSR) repository. 


## Getting Started

If you wish to run the widget without making any changes, use the pre-built version located in the dist/assets folder and start with step six. Alternatively, follow the instructions below to build and deploy the widget.

1. Download this project or ```git clone https://github.com/dwfinnegan/post-call-work```
2. From the project directory run ```npm install```
3. Modify the code to suit your needs
4. Run ```npm run build``` to build the widget
   - The build process dumps the output in the dist/assets folder
5. Rename the file to your needs, but I would suggest post-call-work.js 
6. Copy the file post-call-work.js to your preferred cloud storage platform
7. Add the widget to your Desktop Layout headless section (example snippet below). 
   - cadVariable: Name of the Boolean CAD variable
   - auxCodeId: Id of the Idle Aux code

<pre lang="JSON">

  "headless": {
    "id": "dw-headless",
    "widgets": {
      "comp1":{
        "comp": "post-call-work",
        "script": "https://<span style="color:darkred;">cloud storage path</span>/post-call-work.js",
        "properties": {
          "cadVariable": "<span style="color:darkred;">Set-CAD-Variable-Here</span>",
          "auxCodeId": "<span style="color:darkred;">Set-Aux-Code-Id-Here</span>"
        }
      }
    },
    "layout": {
      "areas": [[ "comp1" ]],
      "size": { "cols": [ 1 ], "rows": [ 1 ] }
    }
  },

</pre>

8. Create a Flow Variable (CAD Variable) in your flow with a name matching the **cadVariable** in step 7 and the following settings:
   - Name: postCallWork (or your preferred name)
   - Variable Type: Boolean
   - Default Value: False
   - Desktop Label: Post Call Work
   - Agent Editable: Yes

9. Create a Idle Code on Control Hub with the following settings:
   - name: Post Call Work (or your preferred name)
   - Code Type: Default Idle Work Type

> Note: if you use a different Code Type you will have to modify this line in the source code.<br>
> ```await Desktop.agentStateInfo.stateChange({ state: "Idle", auxCodeIdArray: this.auxCodeId });```

10. Copy the id from the Idle code to the **auxCodeId** in step 7
11. On the Agents Desktop profile ensure they have access to the Idle code that was just created and set the wrap-up codes to auto wrap-up with a timeout of 1 second