/**********************************************************************
 *
 * $Id: xhr.js,v 1.1.1.1 2006-10-20 10:49:46 oivindh Exp $
 *
 * purpose: a simple cross-browser XmlHttpRequest interface that adds
 *          support for multiple, concurrent requests
 *
 * author: Paul Spencer (pspencer@dmsolutions.ca)
 *
 * TODO:
 *   - reponse only contains responseText, should contain response so
 *     access to reponseXML is possible if we ever want to implement
 *     xml stuff (i.e. real AJAX)
 * 
 **********************************************************************
 *
 * Copyright (c) 2005, DM Solutions Group Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 *
 **********************************************************************/

/* to make an asynchronous call to the server, execute the call() function
 * with the URL to the script to be executed.  The second and third
 * parameters to call() define object and method to call when the server
 * returns its response ... if the second parameter is null, third is
 * just a function.  If second is an object, then the third is a method
 * of that instance.
 *
 * There is an optional fourth parameter to issue the request as a POST
 * to the server.  This is important in some browsers due to limited 
 * URL length.
 * 
 * The callback function is called when the request completes.  There is
 * currently no callback for errors so they just silently fail if the
 * server side script dies.  The callback function is passed a single
 * parameter, the text output of the server side script.  In ka-Map, this
 * text is typically some javascript to eval().
 */

var aXmlHttp = new Array();
var aXmlResponse = new Array();

function xmlResult()
{
    for(var i=0;i<aXmlHttp.length;i++)
    {
        if (aXmlHttp[i] && aXmlHttp[i][0] && aXmlHttp[i][0].readyState==4 )
	{
            var u = aXmlHttp[i][3];
	    var f = aXmlHttp[i][2];
            var o = aXmlHttp[i][1];
            var s = aXmlHttp[i][0].responseText;
	    var status = aXmlHttp[i][0].status;
	   
	      
	    //must null out record before calling function in case
            //function invokes another xmlHttpRequest.
            aXmlHttp[i][0] = null;
            aXmlHttp[i][1] = null;
            aXmlHttp[i]    = null;
            if (status==200)
                f.apply(o, new Array(s));
            else {
                OpenLayers.Console.info("xmlResult: status", status);
                if (status == 503)
                   setTimeout(function() { window.location.reload(); }, 25000);
                else if (status == 0)
                   setTimeout(function() { call(u, o, f); }, 30000);
           }
        }
    }
}

/* LA7ECA: Silently abort the call */
function abortCall(i)
{
    if (aXmlHttp[i]!= null && aXmlHttp[i][0] != null)
       aXmlHttp[i][0].abort();
}



var ajax_basicAuthString = null; 

function ajax_setBasicAuth(user, pass)
{  
    var tok = user + ':' + pass;  
    var hash = Base64.encode(tok);
    ajax_basicAuthString = "Basic " + hash;
}

function ajax_clearBasicAuth() {
    ajax_basicAuthString = null;
}



// u -> url
// o -> object (can be null) to invoke function on
// f -> callback function
// p -> optional argument to specify POST
function call(u,o,f)
{
    var method = "GET";
    var dat = "";
    if (arguments.length==4){
      method = "POST";
      var tmp = u.split(/\?/);
      u = tmp[0];
      dat = tmp[1];
      if (dat==null) dat = "empty";
    }
    var idx = aXmlHttp.length;
    for(var i=0; i<idx;i++)
    if (aXmlHttp[i] == null)
    {
        idx = i;
        break;
    }
    aXmlHttp[idx]=new Array(2);
    aXmlHttp[idx][0] = getXMLHTTP();
    aXmlHttp[idx][1] = o;
    aXmlHttp[idx][2] = f;
    aXmlHttp[idx][3] = u;
    
    if(aXmlHttp[idx])
    {
        aXmlHttp[idx][0].open(method, u, true);
	aXmlHttp[idx][0].onreadystatechange=xmlResult;       
     
        if  (ajax_basicAuthString != null)
          aXmlHttp[idx][0].setRequestHeader('Authorization', ajax_basicAuthString);
        if(method == "POST"){
	  aXmlHttp[idx][0].setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          aXmlHttp[idx][0].send(dat);
        }
        else if(method =="GET")
	   { aXmlHttp[idx][0].send(null);}
    }
    return idx;
}




function getXMLHTTP()
{
    var A=null;
    if(!A && typeof XMLHttpRequest != "undefined")
    {
        A=new XMLHttpRequest();
    }
    if (!A)
    {
        try
        {
            A=new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch(e)
        {
            try
            {
                A=new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch(oc)
            {
                A=null
            }
        }
    }    
    return A;
}
