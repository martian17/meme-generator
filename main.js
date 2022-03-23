let dragMgr = function(elem, start, move, end) {
    elem.on("mousedown", (e) => {
        start(e.pageX, e.pageY, e);
        let onmove = (e) => {
            //console.log(e.pageY);
            move(e.pageX, e.pageY, e);
        };
        let onend = (e) => {
            window.removeEventListener("mousemove",onmove);
            window.removeEventListener("mouseup",onend);
            end(e);
        };
        window.addEventListener("mousemove", onmove);
        window.addEventListener("mouseup", onend);
    });
    elem.on("touchstart", (e) => {
        start(e.touches[0].pageX, e.touches[0].pageY, e);
        let onmove = (e) => {
            move(e.touches[0].pageX, e.touches[0].pageY, e);
        };
        let onend = (e) => {
            window.removeEventListener("touchmove",onmove);
            window.removeEventListener("touchend",onend);
            end(e);
        };
        window.addEventListener("touchmove", onmove);
        window.addEventListener("touchend", onend);
    });
};

let textToLines = function(text){
    let l = text.split("\n");
    let lines = [];
    for(let i = 0; i < l.length; i++){
        lines.push(l[i]);
        if(l[i] === ""){
            i++;
        }
    }
    return lines;
};


let getLineHeight = function(el) {
    let temp = document.createElement(el.nodeName), ret;
    temp.setAttribute("style", "margin:0; padding:0; "
        + "font-family:" + (el.style.fontFamily || "inherit") + "; "
        + "font-size:" + (el.style.fontSize || "inherit"));
    temp.innerHTML = "A";

    el.parentNode.appendChild(temp);
    ret = temp.clientHeight;
    temp.parentNode.removeChild(temp);

    return ret;
}

class TextBox extends ELEM{
    constructor(e,render){
        super("div","class:wrap",0,`
        position:absolute;
        padding:3px;
        box-sizing:border-box;
        top:${e.pageY-25}px;
        left:${e.pageX-10}px;
        cursor: move;
        border:dashed 2px #fff;
        `);
        let textbox = this.add("div","contenteditable:true;","",`
        font-size:35px;
        color:#ff02;
        text-shadow: 2px 2px 0px #0002;
        padding:10px;
        cursor:text;
        caret-color : #ff0;
        `);
        this.textbox = textbox;
        textbox.on("focusout",()=>{
            this.style("border:none;");
            if(textbox.e.innerText.trim() === ""){
                this.remove();
            }
        });
        textbox.on("focus",()=>{
            this.style("border:dashed 2px #fff;");
        });
        setTimeout(a=>textbox.e.focus(),0);
        textbox.on("mousedown",(e)=>{
            e.stopPropagation();
        });
        textbox.on("input",()=>{
            render();
        });
        let offset = [];
        dragMgr(this,(x,y,e)=>{
            e.stopPropagation();
            e.preventDefault();
            let box = this.e.getBoundingClientRect();
            let boxx = box.x+window.scrollX;
            let boxy = box.y+window.scrollY;
            offset = [x-boxx,y-boxy];
        },(x,y,e)=>{
            this.style(`
                top:${y-offset[1]}px;
                left:${x-offset[0]}px;
            `);
            render();
        },(e)=>{
            render();
        });
    }
    render(ctx,box1){
        let text = this.e.innerText;
        let box2 = this.textbox.e.getBoundingClientRect();
        let x = box2.x-box1.x;
        let y = box2.y-box1.y;

        ctx.fillStyle = "#ff0";
        ctx.strokeStyle = "#000";
        let style = window.getComputedStyle(this.textbox.e);
        let fontSize = parseInt(style.fontSize);
        let padding = parseInt(style.padding);
        let lineheight = getLineHeight(this.textbox.e);
        ctx.font = `${fontSize}px ${style.fontFamily}`;
        ctx.lineWidth = 5;
        let lines = textToLines(text);
        for(let i = 0; i < lines.length; i++){
            let line = lines[i];
            ctx.strokeText(line,x+padding,y+padding+fontSize-2+lineheight*i);
            ctx.fillText(line,x+padding,y+padding+fontSize-2+lineheight*i);
        }
    };
}



let main = async function(){
    let body = new ELEM(document.body);
    body.add("h1",0,"Harry Potter car meme generator");
    body.add("p",0,"Click on the image, and a draggable textbox will appear");
    let img = new ELEM("img","src:mememememe.jpeg");
    await new Promise((res,rej)=>{
        img.on("load",res);
    });
    let w = img.e.width;
    let h = img.e.height;
    let canvas = body.add("canvas",`width:${img.e.width};height:${img.e.height};`,0,"display:block;");
    let ctx = canvas.e.getContext("2d");
    ctx.drawImage(img.e,0,0,w,h);
    let boxes = body.add("div");

    let render = function(){
        ctx.drawImage(img.e,0,0,w,h);
        let box1 = canvas.e.getBoundingClientRect();
        boxes.children.foreach((text)=>{
            text.render(ctx,box1);
        });
    };

    //create a new text area
    canvas.on("mousedown",(e)=>{
        boxes.add(new TextBox(e,render));
    });
    let btn = body.add("div","","Download",`
    font-size:2em;
    display:inline-block;
    color:#61c4f9;
    border:solid 1px #61c4f9;
    padding:0.5em;
    border-radius:2px;
    margin:0.5em;
    `);
    btn.on("click",()=>{
        let link = document.createElement('a');
        link.download = 'filename.png';
        link.href = canvas.e.toDataURL();
        link.click();
    });

};

main();