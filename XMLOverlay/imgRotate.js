

function ImgRotate (img)
{
     this.rdeg = 0;
     this.image = document.getElementById(img);
     this.canvas = _BrowserIdent_newCanvas(this.image.parentNode);
     if (window.matchMedia( "(min-width: 1000px)" )) {
       this.image.width = "39px";
       this.image.height = "39px"; 
     }
     this.canvas.setAttribute('width', this.image.width);
     this.canvas.setAttribute('height', this.image.height);
     
     this.canvasCtxt = _BrowserIdent_getCanvasContext(this.canvas);
     if (this.canvasCtxt != null) {
        this.image.style.visibility = 'hidden';
        this.image.style.position = 'absolute';
     } else 
        this.canvas.parentNode.removeChild(this.canvas);
     this.rotate(0);
}   
   

ImgRotate.prototype.rotate = function (deg)   
{
     this.rdeg = deg;
     if (this.canvasCtxt == null)
        return;
     clearCanvas(this.canvasCtxt, this.canvas);
     var p_rad = deg * Math.PI / 180;
     this.canvasCtxt.rotate(p_rad);
   
     var xoff = Math.cos(p_rad)*0.5*this.image.width - Math.sin(p_rad)*0.5*this.image.height; 
     var yoff = Math.cos(p_rad)*0.5*this.image.width + Math.sin(p_rad)*0.5*this.image.height;
     var y = xoff - 0.5*this.image.width;
     var x = yoff - 0.5*this.image.height; 

     this.canvasCtxt.drawImage(this.image, x, y);
     
     function clearCanvas(context, canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        var w = canvas.width;
        canvas.width = 1;
        canvas.width = w;
     }
}




ImgRotate.prototype.getRotation = function ()
{
    return this.rdeg;
}

