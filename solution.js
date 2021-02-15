/*
finger print solution library
by andy
 */
const url = require('url');
const path = require('path');
var HTMLParser = require('node-html-parser');
const axios = require('axios');


var SOLUTION = function (SETTING) {

    this.IP = SETTING.hasOwnProperty("ip") ? SETTING.ip : "";
    this.URL = 'http://'+this.IP;
    this.KEY = SETTING.hasOwnProperty("key") ? SETTING.key : "";
    this.FN = 0;
    this.NEW_LINE = "\r\n";

    this.HTTP_REQUEST = async (soap_request, start_point) => {
        start_point = start_point || "/iWsService";
        var config = {
            headers: {'Content-Type': 'text/xml'}
        };
        try {
            let resp= await axios.post(this.URL+start_point, soap_request, config);
            return  resp.data;
        } catch (e){
            return  "";
        }
    }
    
    this.CONNECT_TO = async() => {
        try{
            let resp = await axios.get(this.URL);
            return resp.headers.server;
        } catch (e) {
            return "";
        }
        let resp= await axios.post(this.URL+start_point, soap_request, config);
        return resp.headers.server;
    }

    this.GET_SIDIK_JARI = async (PIN) => {
        PIN = PIN || "All";
        let soap_request=`<GetUserTemplate><ArgComKey xsi:type="xsd:integer">${this.KEY}</ArgComKey><Arg><PIN xsi:type="xsd:integer">${PIN}</PIN></Arg></GetUserTemplate>`;
        let data = await this.HTTP_REQUEST(soap_request);
        return this.DATA_ARRAY(data);
    }

    this.RESTART = async()=> {
        let soap_request=`<Restart><ArgComKey Xsi:type="xsd:integer">${this.KEY}</ArgComKey></Restart>`;
        let data =  await this.HTTP_REQUEST(soap_request);
        console.log(data);
        return this.PARSE_DATA(data, "Result");
    }

    this.GET_USER_INFO = async(PIN) => {
        PIN = PIN || "All";
        let soap_request=`<GetUserInfo><ArgComKey xsi:type="xsd:integer">${this.KEY}</ArgComKey><Arg><PIN xsi:type="xsd:integer">${PIN}</PIN></Arg></GetUserInfo>`;
        let data = await this.HTTP_REQUEST(soap_request);
        return this.DATA_ARRAY(data);
    }

    this.GET_LOG = async(PIN) => {
        PIN = PIN || "All";
        let soap_request=`<GetAttLog><ArgComKey xsi:type="xsd:integer">${this.KEY}</ArgComKey><Arg><PIN xsi:type="xsd:integer">${PIN}</PIN></Arg></GetAttLog>`;
        let data = await this.HTTP_REQUEST(soap_request);
        return this.DATA_ARRAY(data);
    }

    this.DELETE_LOG = async(PIN) => {
        PIN = PIN || "All";
        let soap_request=`<ClearData><ArgComKey xsi:type="xsd:integer">${this.KEY}</ArgComKey><Arg><Value xsi:type="xsd:integer">${PIN}</Value></Arg></ClearData>`;
        let data = await this.HTTP_REQUEST(soap_request);
        return this.DATA_ARRAY(data);
    }

    this.GET_MACHINE = async(NAME) => {
        NAME = NAME || "Platform";
        let soap_request=`<GetDeviceStrInfo><ArgComKey xsi:type="xsd:integer">${this.KEY}</ArgComKey></GetDeviceStrInfo>`;
        let data = await this.HTTP_REQUEST(soap_request);
        console.log(data)
        return data;
    }

    this.GET_SYNC_TIME = async() => {
        var date = new Date();
        var DATE = date.toISOString().split('T')[0];
        var TIME = date.toTimeString().split(' ')[0];
        let soap_request=`<SetDate><ArgComKey xsi:type="xsd:integer">${this.KEY}</ArgComKey><Arg><Date xsi:type="xsd:string">${DATE}</Date><Time xsi:type=\"xsd:string\">${TIME}</Time></Arg></SetDate>`;
        let data = await this.HTTP_REQUEST(soap_request);
        return this.PARSE_DATA(data, "Information");
    }

    
    this.PARSE_DATA = (str, tag) => {
        var root = HTMLParser.parse(str);
        var texts = [].map.call( root.querySelectorAll(tag), function(v){
            return v.textContent || v.innerText || "";
        });
        return texts;
    }


    this.DATA_ARRAY = (str) => {
        let stores = [];
        try {
            let PIN = this.PARSE_DATA(str,"PIN");
            let Name = this.PARSE_DATA(str,"Name");
            let Password = this.PARSE_DATA(str,"Password");
            let Group = this.PARSE_DATA(str,"Group");
            let Privilege = this.PARSE_DATA(str,"Privilege");
            let Card = this.PARSE_DATA(str,"Card");
            let FingerID = this.PARSE_DATA(str,"FingerID");
            let Valid = this.PARSE_DATA(str,"Valid");
            let Template = this.PARSE_DATA(str,"Template");
            let DateTime = this.PARSE_DATA(str,"DateTime");
            let Verified = this.PARSE_DATA(str,"Verified");
            let Status = this.PARSE_DATA(str,"Status");
            let WorkCode = this.PARSE_DATA(str,"WorkCode");

            if(PIN.length > 0){
                for(var i=0;i<PIN.length;i++){
                    let obj = {
                        PIN : PIN[i] || 0,
                        Name : Name[i] || "",
                        Password : Password[i] || "",
                        Group : Group[i] || "",
                        Privilege : Privilege[i] || "",
                        Card : Card[i] || "",
                        FingerID : FingerID[i] || 0,
                        Valid : Valid[i] || 0,
                        Template : Template[i] || "",
                        DateTime : DateTime[i] || "",
                        Verified : Verified[i] || "",
                        Status : Status[i] || 0,
                        WorkCode : WorkCode[i] || 0
                    }
                    stores.push(obj)
                }
            }
        } catch(e) {
            console.log(e)
        }

        return stores;
    }
}



module.exports = SOLUTION;