var loadSchemaParagraph = document.getElementById('LoadSchemaParagraph');
var loadSchemaButton = document.getElementById('LoadSchemaButton');
var schemaOptions = document.getElementById('SchemaOptions');
var searchText = document.getElementById('SearchText');
var lastSearchText = '';
var searchResetButton = document.getElementById('SearchReset');
var openNewWindow = document.getElementById('OpenNewWindow');
var searchResultDiv = document.getElementById('SearchResultDiv');
var firstSearchResult = document.getElementById('SearchResult1');
var tooManyResults = document.getElementById('TooManyResults');
var statusText = document.getElementById('Status');
var canvasContainer = document.getElementById('canvas-container');
var tracePar = document.getElementById('trace');
var bottomLineParagraph = document.getElementById('BottomLineParagraph');

var Nodes = new Array();
//Nodes.push({name: 'FundsXML4', left: 0, top: 0, right: 0, bottom: 0});
var ComplexTypes = new Array();
var SimpleTypes = new Array();
var SearchResults = new Array();

var rootNodeIndex = null;
var bResolveComplexTypes = false;

var NodeTypeComplex = 1;
var NodeTypeSimple = 2;
var NodeTypeSequence = 3;
var NodeTypeChoice = 4;
var NodeTypeString = 5;
var NodeTypeNumber = 6;
var NodeTypeInteger = 7;
var NodeTypeDate = 8;
var NodeTypeDateTime = 9;
var NodeTypeBoolean = 10;

var NodeTypeNames = ["", "Complex", "Simple", "Sequence", "Choice", "String", "Number", "Integer", "Date", "DateTime", "Boolean"];

var nMaxSearchResults = 100;
var bTooManySearchResults = false;

searchResetButton.style.display = "none";

if (window != window.top)
    openNewWindow.style.display = "inline-block";


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Schema functions


function IsRealNode(nodeType) {
    var result = true;
    if (nodeType == NodeTypeChoice || nodeType == NodeTypeSequence)
        result = false;
    return result;
}


function GetFirstChildNode(parentNode, nodeName) {
    var result;
    var childNodes = parentNode.childNodes;
    var i = 0;

    while (i < childNodes.length && !result)
        if (childNodes[i].nodeName == nodeName)
            result = childNodes[i];
        else
            i++;

    return result;
}


function ShowChildNodes(parentNode) {
    var childNodes = parentNode.childNodes;
    var txt = "ChildNodes: <br>";

    for (i = 0; i < childNodes.length; i++)
        txt += "Nodename: " + childNodes[i].nodeName + " (nodetype: " + childNodes[i].nodeType + ") <br>";

    tracePar.innerHTML = txt;
}


/*
<xs:element name="FundsXML4">
<xs:annotation>
  <xs:documentation>Root element of FundsXML V4</xs:documentation>
</xs:annotation>
<xs:complexType>
<xs:sequence>
<xs:element name="ControlData" type="ControlDataType">
  <xs:annotation>
    <xs:documentation>Meta data of xml document (like unique id, date, data supplier, language, ...)</xs:documentation>
  </xs:annotation>
  ...
</xs:element>
<xs:complexType name="FundType">
<xs:sequence>
<xs:element name="Identifiers" type="IdentifiersType">
  <xs:annotation>
    <xs:documentation>Identifiers of fund</xs:documentation>
  </xs:annotation>
</xs:element>
<xs:element name="Names" type="NamesType">
  <xs:annotation>
    <xs:documentation>Names of fund</xs:documentation>
  </xs:annotation>
</xs:element>
<xs:complexType name="CountrySpecificDataATType">
  <xs:complexContent>
    <xs:extension base="xs:anyType"/>
  </xs:complexContent>
</xs:complexType>
*/

function ParseComplexTypeNode(node, parentIndex) {
    //Nodes[parentIndex].type = NodeTypeComplex;

    var childNodes = node.childNodes;
    var nodeName;
    var previousIndex = null;
    var nodeIndex = null;
    var i = null;

    for (i = 0; i < childNodes.length; i++) {
        if (childNodes[i].nodeType == 1) {
            nodeName = childNodes[i].nodeName;
            /*if (nodeName == "xs:annotation") {
            // todo
            }*/
            if (nodeName == "xs:choice" || nodeName == "xs:sequence") {
                previousIndex = nodeIndex;
                nodeIndex = AddNode(childNodes[i], parentIndex, previousIndex);
                if (parentIndex != null && previousIndex == null)
                    Nodes[parentIndex].firstChildIndex = nodeIndex;
                if (previousIndex != null)
                    Nodes[previousIndex].nextIndex = nodeIndex;
            }
            if (nodeName == "xs:complexContent") {
                var extensionNode = GetFirstChildNode(childNodes[i], "xs:extension");
                if (extensionNode) {
                    Nodes[parentIndex].baseTypeName = extensionNode.getAttribute("base");
                }
            }
        }
    }
}


function ParseSequenceNode(node, parentIndex) {
    var childNodes = node.childNodes;
    var previousIndex = null;
    var nodeIndex = null;
    var i = null;

    for (i = 0; i < childNodes.length; i++) {
        if (childNodes[i].nodeType == 1) {
            previousIndex = nodeIndex;
            nodeIndex = AddNode(childNodes[i], parentIndex, previousIndex);
            if (parentIndex != null && previousIndex == null)
                Nodes[parentIndex].firstChildIndex = nodeIndex;
            if (previousIndex != null)
                Nodes[previousIndex].nextIndex = nodeIndex;
        }
    }
}


function StrLen(text) {
    var result = 0;
    var vt = typeof value;

    if (vt == 'string')
        result = Number(text.length);

    return result;
}


function ToNumber(value, default_value) {
    var result;
    var vt = typeof value;

    if (vt == 'number' || vt == 'string')
        result = Number(value);
    else
        result = default_value;

    return result;
}


function ToNumberUnbounded(value, default_value) {
    var result;

    if (value == 'unbounded')
        result = -1;
    else {
        var vt = typeof value;
        if (vt == 'number' || vt == 'string')
            result = Number(value);
        else
            result = default_value;
    }

    return result;
}


/*
<xs:simpleType>
<xs:restriction base="xs:string">
<xs:enumeration value="AssetMasterData"/>
<xs:simpleType name="ISOCurrencyCodeType">
  <xs:annotation>
    <xs:documentation xml:lang="en">Three-letter ISO-CurrencyCode (ISO 4217)</xs:documentation>
    <xs:documentation xml:lang="de">Dreistelliger ISO-Waehrungscode (ISO 4217)</xs:documentation>
  </xs:annotation>
  <xs:restriction base="xs:string">
    <xs:maxLength value="3"/>
    <xs:minLength value="3"/>
    <xs:pattern value="[A-Z]{3}"/>
  </xs:restriction>
</xs:simpleType>
<xs:element name="DataOperation" minOccurs="0">
  <xs:annotation>
    <xs:documentation>Initial, Amend, Delete</xs:documentation>
  </xs:annotation>
  <xs:simpleType>
    <xs:restriction base="xs:string">
      <xs:minLength value="5"/>
      <xs:maxLength value="7"/>
      <xs:enumeration value="INITIAL"/>
      <xs:enumeration value="AMEND"/>
      <xs:enumeration value="DELETE"/>
    </xs:restriction>
  </xs:simpleType>
</xs:element>
<xs:element name="UnlistedType">
  <xs:annotation>
    <xs:documentation>Description of other document types</xs:documentation>
  </xs:annotation>
  <xs:simpleType>
    <xs:restriction base="Text128Type">
      <xs:minLength value="1"/>
    </xs:restriction>
  </xs:simpleType>
</xs:element>
*/

function ParseSimpleTypeNode(node, destIndex) {
    var internalNodeName;
    var restrictionNode = GetFirstChildNode(node, "xs:restriction");

    internalNodeName = Nodes[destIndex].name;
    if (internalNodeName == "AssetTypeType")
        internalNodeName = "";

    if (restrictionNode) {
        Nodes[destIndex].baseTypeName = restrictionNode.getAttribute("base");
        Nodes[destIndex].enumeration = new Array();
        var childNodes = restrictionNode.childNodes;

        for (i = 0; i < childNodes.length; i++)
            if (childNodes[i].nodeType == 1) {
                internalNodeName = childNodes[i].nodeName;
                if (internalNodeName == "xs:minLength")
                    Nodes[destIndex].minLength = childNodes[i].getAttribute("value");
                if (internalNodeName == "xs:maxLength")
                    Nodes[destIndex].maxLength = childNodes[i].getAttribute("value");
                if (internalNodeName == "xs:pattern")
                    Nodes[destIndex].pattern = childNodes[i].getAttribute("value");
                if (internalNodeName == "xs:enumeration")
                    Nodes[destIndex].enumeration.push(childNodes[i].getAttribute("value"));
            }
    }
}


/*
<xs:element name="Amount" maxOccurs="unbounded">
  <xs:annotation>
    <xs:documentation xml:lang="en">Amounts in currency as defined in attribute</xs:documentation>
    <xs:documentation xml:lang="de">Betrag in frei waehlbarer Waehrung</xs:documentation>
  </xs:annotation>
  <xs:complexType>
    <xs:simpleContent>
      <xs:extension base="xs:decimal">
        <xs:attribute name="ccy" type="ISOCurrencyCodeType" use="required"/>
        <xs:attribute name="isfundccy" type="xs:boolean"/>
        <xs:attribute name="issubfundccy" type="xs:boolean"/>
        <xs:attribute name="isshareclassccy" type="xs:boolean"/>
      </xs:extension>
    </xs:simpleContent>
  </xs:complexType>
</xs:element>
*/

function ParseSimpleContentNode(node, destIndex) {
    var internalNodeName;
    var extensionNode = GetFirstChildNode(node, "xs:extension");

    if (extensionNode) {
        Nodes[destIndex].baseTypeName = extensionNode.getAttribute("base");
        Nodes[destIndex].attributes = new Array();
        var childNodes = extensionNode.childNodes;

        for (i = 0; i < childNodes.length; i++)
            if (childNodes[i].nodeType == 1) {
                internalNodeName = childNodes[i].nodeName;
                if (internalNodeName == "xs:attribute") {
                    var attribute = new Object();
                    attribute.name = childNodes[i].getAttribute("name");
                    attribute.type = childNodes[i].getAttribute("type");
                    attribute.use = childNodes[i].getAttribute("use");  // mandatory attribute: use="required"
                    Nodes[destIndex].attributes.push(attribute);
                }
            }
    }
}


function UpdateTypeDescription(nodeIndex) {
    var typeDescription;

    if (Nodes[nodeIndex].typeName)
        typeDescription = Nodes[nodeIndex].typeName;

    if (Nodes[nodeIndex].baseTypeName) {
        if (typeDescription)
            typeDescription += ":  " + Nodes[nodeIndex].baseTypeName;
        else
            typeDescription = Nodes[nodeIndex].baseTypeName;

        var minLength = Nodes[nodeIndex].minLength;
        var maxLength = Nodes[nodeIndex].maxLength;

        if (minLength)
            if (maxLength)
                if (minLength == maxLength)
                    typeDescription += " (" + maxLength + " chars)";
                else
                    typeDescription += " (" + minLength + "-" + maxLength + " chars)";
            else
                typeDescription += " (min " + minLength + " chars)";
        else if (maxLength)
            typeDescription += " (max " + maxLength + " chars)";
        /*
        if (Nodes[nodeIndex].pattern)
        typeDescription += " " + Nodes[nodeIndex].pattern;
        */
    }

    if (typeDescription) {
        var minOccurs = Nodes[nodeIndex].minOccurs;
        var maxOccurs = Nodes[nodeIndex].maxOccurs;
        /*
        if (maxOccurs == "1")
        if (minOccurs == "0")
        typeDescription += "  [optional]";
        else
        typeDescription += "  [mandatory]";
        else
        */
        if (maxOccurs != "1")
            if (minOccurs == maxOccurs)
                typeDescription += "  [" + maxOccurs + "]";
            else if (maxOccurs > 0)
                typeDescription += "  [" + minOccurs + "..." + maxOccurs + "]";
            else
                typeDescription += "  [" + minOccurs + "...unbound]";  // "...&#8734;]";  // "...&infin;]";
    }

    Nodes[nodeIndex].typeDescription = typeDescription;
}


function AddNode(node, parentIndex, previousIndex) {
    var mynode = new Object();
    var complexTypeNode;

    mynode.parentIndex = parentIndex;
    mynode.previousIndex = previousIndex;

    var internalNodeName = node.nodeName;

    if (internalNodeName == "xs:choice") {
        mynode.type = NodeTypeChoice;
    }

    if (internalNodeName == "xs:sequence") {
        mynode.type = NodeTypeSequence;
    }

    if (internalNodeName == "xs:element") {
        mynode.name = node.getAttribute("name");
        mynode.typeName = node.getAttribute("type");
        mynode.minOccurs = ToNumber(node.getAttribute("minOccurs"), 1);
        mynode.maxOccurs = ToNumberUnbounded(node.getAttribute("maxOccurs"), 1);  // 'unbounded'
        if (mynode.typeName && mynode.typeName.length > 0 && mynode.typeName.substr(0, 3) != "xs:")
            mynode.type = NodeTypeComplex;
    }

    //mynode.annotation = null;
    mynode.firstChildIndex = null;
    mynode.expanded = false;
    mynode.showAttributes = true;

    var annotationNode = GetFirstChildNode(node, "xs:annotation");
    if (annotationNode) {
        mynode.annotation = "Trace-1";
        docNode = GetFirstChildNode(annotationNode, "xs:documentation");
        if (docNode) {
            mynode.annotation = "Trace-2";
            mynode.annotation = docNode.textContent;   //.nodeValue;
        }
    }

    var nodeIndex = Nodes.length;
    Nodes.push(mynode);

    /*
    if (mynode.name == "UnlistedType")
    var i = 0;
    */

    if (!mynode.typeName) {
        var simpleTypeNode = GetFirstChildNode(node, "xs:simpleType");
        if (simpleTypeNode)
            ParseSimpleTypeNode(simpleTypeNode, nodeIndex);
    }

    if (!mynode.typeName) {
        complexTypeNode = GetFirstChildNode(node, "xs:complexType");
        if (complexTypeNode) {
            var simpleContentNode = GetFirstChildNode(complexTypeNode, "xs:simpleContent");
            if (simpleContentNode)
                ParseSimpleContentNode(simpleContentNode, nodeIndex);
        }
    }

    UpdateTypeDescription(nodeIndex);

    if (Nodes.length < 100000) {
        if (mynode.type == NodeTypeChoice || mynode.type == NodeTypeSequence)
            ParseSequenceNode(node, nodeIndex);
        else {
            if (!mynode.typeName) {
                complexTypeNode = GetFirstChildNode(node, "xs:complexType");
                if (complexTypeNode) {
                    Nodes[nodeIndex].type = NodeTypeComplex;
                    ParseComplexTypeNode(complexTypeNode, nodeIndex);
                }
            }
        }

        if (bResolveComplexTypes && !Nodes[nodeIndex].firstChildIndex) {
            if (mynode.type == NodeTypeComplex && mynode.typeName && mynode.typeName.length > 0)
                ResolveComplexType(nodeIndex);
            if (mynode.baseTypeName && mynode.baseTypeName.length > 0)
                ResolveSimpleBaseType(nodeIndex);
        }
    }

    return nodeIndex;
}


function XPath(nodeIndex) {
    var result = "";
    var nodeType = Nodes[nodeIndex].type;
    if (nodeType != NodeTypeChoice && nodeType != NodeTypeSequence)
        result = "/" + Nodes[nodeIndex].name;
    var parentIndex = Nodes[nodeIndex].parentIndex;
    if (parentIndex)
        result = XPath(parentIndex) + result;
    return result;
}


function TypeNameUsedAbove(nodeIndex, typeName) {
    var result = false;
    var parentIndex = Nodes[nodeIndex].parentIndex;

    /*
    if (parentIndex) {
    if (Nodes[parentIndex].typeName == typeName)
    result = true;
    else
    result = TypeNameUsedAbove(parentIndex, typeName);
    }*/

    while (parentIndex && !result) {
        if (Nodes[parentIndex].typeName == typeName)
            result = true;
        else
            parentIndex = Nodes[parentIndex].parentIndex;
    }

    return result;
}


function SetNodesExpanded(nNodeIndex, bExpanded, nLevels) {
    var firstChildIndex = Nodes[nNodeIndex].firstChildIndex;

    if (firstChildIndex) {
        Nodes[nNodeIndex].expanded = bExpanded;

        if (nLevels > 1) {
            var nextNodeIndex = firstChildIndex;
            var nNextLevels = nLevels - 1;

            while (nextNodeIndex) {
                SetNodesExpanded(nextNodeIndex, bExpanded, nNextLevels);
                nextNodeIndex = Nodes[nextNodeIndex].nextIndex;
            }
        }
    }
}


function CopyChildNodes(destNodeIndex, sourceNodeIndex) {
    var firstChildIndex = Nodes[sourceNodeIndex].firstChildIndex;

    if (firstChildIndex) {
        var sourceNode = Nodes[firstChildIndex];
        var newNode = new Object();
        newNode.parentIndex = destNodeIndex;
        newNode.name = sourceNode.name;
        newNode.type = sourceNode.type;
        newNode.typeName = sourceNode.typeName;
        newNode.baseTypeName = sourceNode.baseTypeName;
        newNode.minOccurs = sourceNode.minOccurs;
        newNode.maxOccurs = sourceNode.maxOccurs;
        newNode.minLength = sourceNode.minLength;
        newNode.maxLength = sourceNode.maxLength;
        newNode.annotation = sourceNode.annotation;
        newNode.enumeration = sourceNode.enumeration;
        newNode.attributes = sourceNode.attributes;
        newNode.typeDescription = sourceNode.typeDescription;
        if (newNode.attributes)
            newNode.showAttributes = true; // for testing only !!!

        var newNodeIndex = Nodes.length;
        Nodes.push(newNode);
        Nodes[destNodeIndex].firstChildIndex = newNodeIndex;

        CopyChildNodes(newNodeIndex, firstChildIndex);

        var nextSourceIndex = sourceNode.nextIndex;

        while (nextSourceIndex) {
            var previousIndex = newNodeIndex;
            var sourceNode = Nodes[nextSourceIndex];
            var newNode = new Object();
            newNode.parentIndex = destNodeIndex;
            newNode.name = sourceNode.name;
            newNode.type = sourceNode.type;
            newNode.typeName = sourceNode.typeName;
            newNode.baseTypeName = sourceNode.baseTypeName;
            newNode.minOccurs = sourceNode.minOccurs;
            newNode.maxOccurs = sourceNode.maxOccurs;
            newNode.minLength = sourceNode.minLength;
            newNode.maxLength = sourceNode.maxLength;
            newNode.annotation = sourceNode.annotation;
            newNode.enumeration = sourceNode.enumeration;
            newNode.attributes = sourceNode.attributes;
            newNode.typeDescription = sourceNode.typeDescription;
            if (newNode.attributes)
                newNode.showAttributes = true; // for testing only !!!

            newNodeIndex = Nodes.length;
            Nodes.push(newNode);
            Nodes[previousIndex].nextIndex = newNodeIndex;

            CopyChildNodes(newNodeIndex, nextSourceIndex);

            nextSourceIndex = sourceNode.nextIndex;
        }
    } else {
        if (bResolveComplexTypes) {
            if (Nodes[destNodeIndex].type == NodeTypeComplex)
                ResolveComplexType(destNodeIndex);
            var baseTypeName = Nodes[sourceNodeIndex].baseTypeName;
            if (baseTypeName && baseTypeName.length > 0)
                ResolveSimpleBaseType(destNodeIndex);
        }
    }
}


function ResolveComplexType(nodeIndex) {
    var typeName = Nodes[nodeIndex].typeName;
    var complexTypeIndex = null;
    var i = 1;

    if (typeName) {
        while (i < ComplexTypes.length && !complexTypeIndex) {
            if (ComplexTypes[i].name == typeName)
                complexTypeIndex = i;
            else
                i++;
        }
    }

    if (complexTypeIndex != null)
        if (TypeNameUsedAbove(nodeIndex, typeName))
            Nodes[nodeIndex].recursiveType = true;
        else {
            var sourceNodeIndex = ComplexTypes[complexTypeIndex].nodeIndex;
            Nodes[nodeIndex].baseTypeName = Nodes[sourceNodeIndex].baseTypeName;
            if (Nodes[sourceNodeIndex].firstChildIndex)
                CopyChildNodes(nodeIndex, ComplexTypes[complexTypeIndex].nodeIndex);
            UpdateTypeDescription(nodeIndex);
        }

    if (complexTypeIndex == null && typeName) {
        var simpleTypeIndex = null;
        i = 1;
        while (i < SimpleTypes.length && !simpleTypeIndex) {
            if (SimpleTypes[i].name == typeName)
                simpleTypeIndex = i;
            else
                i++;
        }
        if (simpleTypeIndex) {
            var sourceNodeIndex = SimpleTypes[simpleTypeIndex].nodeIndex;
            /*if (typeName == "Text128Type")
            i = 0;*/
            Nodes[nodeIndex].baseTypeName = Nodes[sourceNodeIndex].baseTypeName;
            Nodes[nodeIndex].minLength = Nodes[sourceNodeIndex].minLength;
            Nodes[nodeIndex].maxLength = Nodes[sourceNodeIndex].maxLength;
            Nodes[nodeIndex].pattern = Nodes[sourceNodeIndex].pattern;
            Nodes[nodeIndex].enumeration = Nodes[sourceNodeIndex].enumeration;
            UpdateTypeDescription(nodeIndex);
        }
    }
}


function ResolveSimpleBaseType(nodeIndex) {
    var baseTypeName = Nodes[nodeIndex].baseTypeName;
    var simpleTypeIndex = null;
    var i = 1;

    while (i < SimpleTypes.length && !simpleTypeIndex) {
        if (SimpleTypes[i].name == baseTypeName)
            simpleTypeIndex = i;
        else
            i++;
    }
    if (simpleTypeIndex) {
        var sourceNodeIndex = SimpleTypes[simpleTypeIndex].nodeIndex;
        if (baseTypeName == "AssetTypeType")
            i = 0;

        if (!Nodes[nodeIndex].minLength)
            Nodes[nodeIndex].minLength = Nodes[sourceNodeIndex].minLength;
        if (!Nodes[nodeIndex].maxLength)
            Nodes[nodeIndex].maxLength = Nodes[sourceNodeIndex].maxLength;
        if (!Nodes[nodeIndex].pattern)
            Nodes[nodeIndex].pattern = Nodes[sourceNodeIndex].pattern;
        if (!Nodes[nodeIndex].enumeration || Nodes[nodeIndex].enumeration.length == 0)
            Nodes[nodeIndex].enumeration = Nodes[sourceNodeIndex].enumeration;

        UpdateTypeDescription(nodeIndex);
    }
}


function LoadComplexTypes(node) {
    //var mynode = {};
    var nodeCount = null;
    var childNodes = node.childNodes;
    //var complexType = {};
    var i = null;

    for (i = 0; i < childNodes.length; i++)
        if (childNodes[i].nodeType == 1 && childNodes[i].nodeName == "xs:complexType") {
            var complexType = new Object();
            complexType.name = childNodes[i].getAttribute("name");
            var mynode = new Object();
            mynode.name = complexType.name;
            mynode.type = NodeTypeComplex;
            nodeCount = Nodes.length;
            Nodes.push(mynode);
            complexType.nodeIndex = nodeCount;
            ParseComplexTypeNode(childNodes[i], nodeCount);
            ComplexTypes.push(complexType);
        }
}


function LoadSimpleTypes(node) {
    var nodeCount = null;
    var childNodes = node.childNodes;
    var i = null;

    for (i = 0; i < childNodes.length; i++)
        if (childNodes[i].nodeType == 1 && childNodes[i].nodeName == "xs:simpleType") {
            var simpleType = new Object();
            simpleType.name = childNodes[i].getAttribute("name");
            var mynode = new Object();
            mynode.name = simpleType.name;
            mynode.type = NodeTypeSimple;
            nodeCount = Nodes.length;
            Nodes.push(mynode);
            simpleType.nodeIndex = nodeCount;
            ParseSimpleTypeNode(childNodes[i], nodeCount);
            SimpleTypes.push(simpleType);
        }
}


//<xs:include schemaLocation="FundsXML4_Core.xsd"/>

function LoadIncludes(sourcePath, node) {
    var schemaLocation;
    var schemaURL;
    var childNodes = node.childNodes;
    var xhttp;
    var xmlDoc;
    var schemaNode;
    var nIncludes = 0;
    var i = null;

    for (i = 0; i < childNodes.length; i++)
        if (childNodes[i].nodeType == 1 && childNodes[i].nodeName == "xs:include") {
            schemaLocation = childNodes[i].getAttribute("schemaLocation");
            if (schemaLocation) {
                statusText.innerHTML = "Loading include file '" + schemaLocation + "' ...";
                schemaURL = sourcePath + schemaLocation;
                xhttp = new XMLHttpRequest();
                xhttp.overrideMimeType('text/xml');
                xhttp.open("GET", schemaURL, false);
                xhttp.send(null);
                xmlDoc = xhttp.responseXML;
                nIncludes++;

                schemaNode = GetFirstChildNode(xmlDoc, "xs:schema");
                LoadSimpleTypes(schemaNode);
                LoadComplexTypes(schemaNode);
            }
        }

    return nIncludes;
}


function ToString(txt) {
    var result = '';
    if (txt !== undefined)
        result = txt;
    return result;
}


function LoadSchemaUI() {
    if (rootNodeIndex)
        return;

    statusText.innerHTML = "Loading schema file ...";
    loadSchemaButton.style.display = 'none';
    //statusText.offsetHeight;
    statusText.style.display = 'block';
    //statusText.offsetHeight;
    /*
    var offsetLeft = statusText.offsetLeft;
    var offsetTop = statusText.offsetTop;
    var clientWidth = statusText.clientWidth;
    var clientHeight = statusText.clientHeight;
    */
    //statusText.redraw(true) // force redraw
    /*
    var n = document.createTextNode(' ');
    statusText.appendChild(n);
    n.parentNode.removeChild(n);
    */
    //loadSchemaButton.parentNode.removeChild(loadSchemaButton);

    //var ctx = canvas.getContext("2d");
    //DrawSizeRuler(ctx, 5, 5, 50);

    //setTimeout(function () { nodeDetails.style.display = "block"; }, 50);
    setTimeout(LoadSchema(), 500);

    //statusText.innerHTML = "offsetLeft = " + offsetLeft;
}


function SampleSchema() {
    var textarea = document.getElementById("schema-text");
    var text
        = '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified" attributeFormDefault="unqualified">\n'
        + '  <xs:element name="Library">\n'
        + '    <xs:annotation>\n'
        + '      <xs:documentation>Root node</xs:documentation>\n'
        + '    </xs:annotation>\n'
        + '      <xs:complexType>\n'
        + '        <xs:sequence>\n'
        + '          <xs:element name="Name">\n'
        + '            <xs:annotation>\n'
        + '              <xs:documentation>Name of library</xs:documentation>\n'
        + '            </xs:annotation>\n'
        + '            <xs:simpleType>\n'
        + '            <xs:restriction base="xs:string">\n'
        + '              <xs:minLength value="1"/>\n'
        + '              <xs:maxLength value="256"/>\n'
        + '            </xs:restriction>\n'
        + '          </xs:simpleType>\n'
        + '        </xs:element>\n'
        + '        <xs:element name="Address" type="AddressType">\n'
        + '          <xs:annotation>\n'
        + '            <xs:documentation>Address details of library like city name, ZIP code, street name and phone number</xs:documentation>\n'
        + '          </xs:annotation>\n'
        + '        </xs:element>\n'
        + '        <xs:element name="OpeningHours" minOccurs="0">\n'
        + '          <xs:annotation>\n'
        + '            <xs:documentation>Opening hours of library</xs:documentation>\n'
        + '          </xs:annotation>\n'
        + '          <xs:complexType>\n'
        + '            <xs:sequence>\n'
        + '              <xs:element name="Monday" type="OpenTimeType" minOccurs="0"/>\n'
        + '              <xs:element name="Tuesday" type="OpenTimeType" minOccurs="0"/>\n'
        + '              <xs:element name="Wednesday" type="OpenTimeType" minOccurs="0"/>\n'
        + '              <xs:element name="Thursday" type="OpenTimeType" minOccurs="0"/>\n'
        + '              <xs:element name="Friday" type="OpenTimeType" minOccurs="0"/>\n'
        + '              <xs:element name="Saturday" type="OpenTimeType" minOccurs="0"/>\n'
        + '              <xs:element name="Sunday" type="OpenTimeType" minOccurs="0"/>\n'
        + '            </xs:sequence>\n'
        + '          </xs:complexType>\n'
        + '        </xs:element>\n'
        + '        <xs:element name="ExistingSince" type="xs:date" minOccurs="0">\n'
        + '          <xs:annotation>\n'
        + '            <xs:documentation>Library existing since</xs:documentation>\n'
        + '          </xs:annotation>\n'
        + '        </xs:element>\n'
        + '        <xs:element name="Book" type="BookType" maxOccurs="unbounded">\n'
        + '          <xs:annotation>\n'
        + '            <xs:documentation>List of books available at library</xs:documentation>\n'
        + '          </xs:annotation>\n'
        + '        </xs:element>\n'
        + '        <xs:element name="CreationDate" type="xs:date">\n'
        + '          <xs:annotation>\n'
        + '            <xs:documentation>Creation date of this data set</xs:documentation>\n'
        + '          </xs:annotation>\n'
        + '        </xs:element>\n'
        + '      </xs:sequence>\n'
        + '    </xs:complexType>\n'
        + '  </xs:element>\n'
        + '  <xs:complexType name="OpenTimeType">\n'
        + '    <xs:sequence>\n'
        + '      <xs:element name="From" type="xs:time"/>\n'
        + '      <xs:element name="To" type="xs:time"/>\n'
        + '    </xs:sequence>\n'
        + '  </xs:complexType>\n'
        + '  <xs:complexType name="BookType">\n'
        + '    <xs:sequence>\n'
        + '      <xs:element name="Author">\n'
        + '        <xs:simpleType>\n'
        + '          <xs:restriction base="xs:string">\n'
        + '            <xs:maxLength value="256"/>\n'
        + '          </xs:restriction>\n'
        + '        </xs:simpleType>\n'
        + '      </xs:element>\n'
        + '      <xs:element name="Publisher">\n'
        + '        <xs:simpleType>\n'
        + '          <xs:restriction base="xs:string">\n'
        + '            <xs:maxLength value="256"/>\n'
        + '          </xs:restriction>\n'
        + '        </xs:simpleType>\n'
        + '      </xs:element>\n'
        + '      <xs:element name="Published" type="xs:date" minOccurs="0"/>\n'
        + '      <xs:element name="Language" type="xs:language"/>\n'
        + '      <xs:element name="Titel">\n'
        + '        <xs:simpleType>\n'
        + '          <xs:restriction base="xs:string">\n'
        + '            <xs:maxLength value="256"/>\n'
        + '          </xs:restriction>\n'
        + '        </xs:simpleType>\n'
        + '      </xs:element>\n'
        + '      <xs:element name="Subtitle" minOccurs="0">\n'
        + '        <xs:simpleType>\n'
        + '          <xs:restriction base="xs:string">\n'
        + '            <xs:maxLength value="256"/>\n'
        + '          </xs:restriction>\n'
        + '        </xs:simpleType>\n'
        + '      </xs:element>\n'
        + '      <xs:element name="ISBN" minOccurs="0">\n'
        + '        <xs:simpleType>\n'
        + '          <xs:restriction base="xs:string">\n'
        + '            <xs:maxLength value="32"/>\n'
        + '          </xs:restriction>\n'
        + '        </xs:simpleType>\n'
        + '      </xs:element>\n'
        + '      <xs:element name="Pages" type="xs:positiveInteger" minOccurs="0"/>\n'
        + '    </xs:sequence>\n'
        + '  </xs:complexType>\n'
        + '  <xs:complexType name="AddressType">\n'
        + '    <xs:sequence>\n'
        + '      <xs:element name="Country" minOccurs="0">\n'
        + '        <xs:annotation>\n'
        + '          <xs:documentation>Country of library</xs:documentation>\n'
        + '        </xs:annotation>\n'
        + '        <xs:simpleType>\n'
        + '          <xs:restriction base="xs:string">\n'
        + '            <xs:maxLength value="256"/>\n'
        + '          </xs:restriction>\n'
        + '        </xs:simpleType>\n'
        + '      </xs:element>\n'
        + '      <xs:element name="CityName" minOccurs="0">\n'
        + '        <xs:annotation>\n'
        + '          <xs:documentation>City name of library address</xs:documentation>\n'
        + '        </xs:annotation>\n'
        + '        <xs:simpleType>\n'
        + '          <xs:restriction base="xs:string">\n'
        + '            <xs:maxLength value="256"/>\n'
        + '          </xs:restriction>\n'
        + '        </xs:simpleType>\n'
        + '      </xs:element>\n'
        + '      <xs:element name="ZIP" type="xs:positiveInteger" minOccurs="0">\n'
        + '        <xs:annotation>\n'
        + '          <xs:documentation>ZIP code of library address</xs:documentation>\n'
        + '        </xs:annotation>\n'
        + '      </xs:element>\n'
        + '      <xs:element name="Street" minOccurs="0">\n'
        + '        <xs:annotation>\n'
        + '          <xs:documentation>Street of library address</xs:documentation>\n'
        + '        </xs:annotation>\n'
        + '        <xs:simpleType>\n'
        + '          <xs:restriction base="xs:string">\n'
        + '            <xs:maxLength value="256"/>\n'
        + '          </xs:restriction>\n'
        + '        </xs:simpleType>\n'
        + '      </xs:element>\n'
        + '      <xs:element name="Phone" minOccurs="0">\n'
        + '        <xs:annotation>\n'
        + '          <xs:documentation>Phone number of library</xs:documentation>\n'
        + '        </xs:annotation>\n'
        + '        <xs:simpleType>\n'
        + '          <xs:restriction base="xs:string">\n'
        + '            <xs:maxLength value="128"/>\n'
        + '          </xs:restriction>\n'
        + '        </xs:simpleType>\n'
        + '      </xs:element>\n'
        + '      <xs:element name="Homepage" minOccurs="0">\n'
        + '        <xs:annotation>\n'
        + '          <xs:documentation>Homepage of library (URL)</xs:documentation>\n'
        + '        </xs:annotation>\n'
        + '        <xs:simpleType>\n'
        + '          <xs:restriction base="xs:string">\n'
        + '            <xs:maxLength value="256"/>\n'
        + '          </xs:restriction>\n'
        + '        </xs:simpleType>\n'
        + '      </xs:element>\n'
        + '    </xs:sequence>\n'
        + '  </xs:complexType>\n'
        + '</xs:schema>';
    textarea.value = text;
    /*
    '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified" attributeFormDefault="unqualified">
    <xs:element name="ListOfBooks">
      <xs:complexType>
        <xs:sequence>
          <xs:element name="Created" type="xs:dateTime"/>
          <xs:element name="SourceSystem" type="xs:string"/>
          <xs:element name="Books" minOccurs="0">
            <xs:complexType>
              <xs:sequence>
                <xs:element name="Book" maxOccurs="unbounded">
                  <xs:complexType>
                    <xs:sequence>
                      <xs:element name="Author" type="xs:string"/>
                      <xs:element name="Publisher" type="xs:string"/>
                      <xs:element name="Published" type="xs:date"/>
                      <xs:element name="Language" type="xs:language"/>
                      <xs:element name="Titel" type="xs:string"/>
                      <xs:element name="Subtitle" type="xs:string"/>
                      <xs:element name="ISBN" type="xs:string"/>
                      <xs:element name="Pages" type="xs:positiveInteger"/>
                    </xs:sequence>
                  </xs:complexType>
                </xs:element>
              </xs:sequence>
            </xs:complexType>
          </xs:element>
        </xs:sequence>
      </xs:complexType>
    </xs:element>
  </xs:schema>';
    */
}


function LoadSchema() {
    if (rootNodeIndex)
        return;

    var complexType = new Object();
    ComplexTypes = new Array();
    ComplexTypes.push(complexType);

    var mynode = new Object();
    Nodes = new Array();
    Nodes.push(mynode); // dummy node at the beginning --> first real item starts with index 1

    statusText.innerHTML = "Loading schema ...";

    var textarea = document.getElementById("schema-text");
    var parser = new DOMParser();

    try {
        xmlDoc = parser.parseFromString(textarea.value, "text/xml");
    } catch (e) {
        // if text is not well-formed,
        statusText.innerHTML = "Not a valid xml document";
        alert("Not a valid xml document");
        return false;
    }
    ;

    statusText.innerHTML = "Schema source successfully loaded ...";

    //var schemaNode = xmlDoc.getElementsByTagName("xs:schema")[0];
    //var rootNode = xmlDoc.getElementsByTagName("/xs:schema/xs:element")[0];
    //var txt = "Root-Nodename: " + rootNode.nodeName + " (nodetype: " + rootNode.nodeType + ")";

    //tracePar.innerHTML = "Schema-Rootnode-Name: " + schemaNode.nodeName;
    //alert(txt);

    // Node-Types:
    // 1 ... Node
    // 3 ... Text
    // 8 ... Comment

    var schemaNode = GetFirstChildNode(xmlDoc, "xs:schema");
    //tracePar.innerHTML = "Schema-Rootnode-Name: " + schemaNode.nodeName;
    //ShowChildNodes(schemaNode);

    /*
    var nIncludes = LoadIncludes(sourcePath, schemaNode);
    statusText.innerHTML = "Processing main schema file '" + schemaURL + "' ...";
    tracePar.innerHTML = "Include files loaded: " + nIncludes + " - loading simple types of main schema file ...";
    */

    LoadSimpleTypes(schemaNode);
    tracePar.innerHTML = "Simple types loaded: " + SimpleTypes.length + " - loading complex types of main schema file ...";

    LoadComplexTypes(schemaNode);
    tracePar.innerHTML = "Complex types loaded: " + ComplexTypes.length + " - processing main tree ...";

    var rootNode = GetFirstChildNode(schemaNode, "xs:element");

    //tracePar.innerHTML = "Rootnode-Name: " + rootNode.getAttribute("name") + " (nodetype: " + rootNode.nodeType + ")";
    //tracePar.innerHTML += " - Rootnode-Type: " + rootNode.getAttribute("type");
    bResolveComplexTypes = true;
    rootNodeIndex = AddNode(rootNode);
    //ShowChildNodes(rootNode);

    statusText.innerHTML = ""; //"Ready";
    /*
    var txt = "Nodes:";
    for (i = 0; i < Nodes.length; i++)
    txt += "<br>Nodes[" + i + "]: parentIndex=" + Nodes[i].parentIndex + ", type='" + NodeTypeNames[Nodes[i].type] + "', name='" + ToString(Nodes[i].name) + "', typeName='" + ToString(Nodes[i].typeName) + "', baseTypeName='" + ToString(Nodes[i].baseTypeName) + "', minOccurs=" + ToString(Nodes[i].minOccurs) + ", maxOccurs=" + ToString(Nodes[i].maxOccurs) + ", firstChildIndex=" + ToString(Nodes[i].firstChildIndex) + ", annotation='" + ToString(Nodes[i].annotation) + "'";
    txt += "<br><br>ComplexTypes:";
    for (i = 0; i < ComplexTypes.length; i++)
    txt += "<br>ComplexTypes[" + i + "]: name='" + ComplexTypes[i].name + "', nodeIndex=" + ComplexTypes[i].nodeIndex;
    txt += "<br><br>SimpleTypes:";
    for (i = 0; i < SimpleTypes.length; i++)
    txt += "<br>SimpleTypes[" + i + "]: name='" + SimpleTypes[i].name + "', nodeIndex=" + SimpleTypes[i].nodeIndex;
    */

    var txt = "ComplexTypes: " + ComplexTypes.length + ", SimpleTypes: " + SimpleTypes.length + ", Nodes: " + Nodes.length + ", rootNodeIndex: " + rootNodeIndex;
    /*
    txt += "<br>";
    for (i = 0; i < Nodes.length; i++)
    txt += "<br>Nodes[" + i + "]: parentIndex=" + Nodes[i].parentIndex + ", firstChildIndex=" + ToString(Nodes[i].firstChildIndex) + ", nextIndex=" + ToString(Nodes[i].nextIndex) + ", type='" + NodeTypeNames[Nodes[i].type] + "', name='" + ToString(Nodes[i].name) + "', typeName='" + ToString(Nodes[i].typeName) + "', baseTypeName='" + ToString(Nodes[i].baseTypeName) + "', minOccurs=" + ToString(Nodes[i].minOccurs) + ", maxOccurs=" + ToString(Nodes[i].maxOccurs) + ", annotation='" + ToString(Nodes[i].annotation) + "'";
    txt += "<br>";
    for (i = 0; i < ComplexTypes.length; i++)
    txt += "<br>ComplexTypes[" + i + "]: name='" + ComplexTypes[i].name + "', nodeIndex=" + ComplexTypes[i].nodeIndex;
    */
    tracePar.innerHTML = txt;

    schemaOptions.style.display = 'block';
    statusText.style.display = 'block';
    canvasContainer.style.display = 'block';

    SetNodeSizes();

    SetNodesExpanded(rootNodeIndex, true, 2);

    CalcNodePositions();

    loadSchemaParagraph.style.display = 'none';

    DrawTree();
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Drawing functions

var PIXEL_RATIO = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
    return dpr / bsr;
})();

createHiDPICanvas = function (w, h, ratio) {
    if (!ratio) {
        ratio = PIXEL_RATIO;
    }
    var can = document.createElement("canvas");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
}

function SetCanvasSize(w, h, ratio) {
    if (!ratio) {
        ratio = PIXEL_RATIO;
    }
    var can = document.getElementById("tree");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
}

var canvas = document.getElementById("tree");
var nCanvasHeight = 5000;
var nCanvasWidth = 5000;

SetCanvasSize(nCanvasWidth, nCanvasHeight); //, 2); // 1.1041666

var nSchemaBorder = 10;
var nSchemaHeight = 0;
var nSchemaWidth = 0;

var canvasContainer = document.getElementById("canvas-container");
var canvasContainerWidth = canvasContainer.clientWidth;
var canvasContainerHeight = canvasContainer.clientHeight;
var canvasContainerScrollLeft = canvasContainer.scrollLeft; //.scrollLeftMax
var canvasContainerScrollTop = canvasContainer.scrollTop; //.scrollTopMax

// set height of canvas container to window height (= full screen)
//canvasContainer.style.height = window.innerHeight + "px"; //document.offsetHeight;

var canvasHeight = window.innerHeight - (schemaOptions.offsetTop + schemaOptions.offsetHeight + searchResultDiv.offsetHeight + bottomLineParagraph.offsetHeight);
canvasContainer.style.height = canvasHeight + "px";


function MakeVisible(x, y) {
    if (x < canvasContainerScrollLeft)
        canvasContainerScrollLeft = x - 10;
    if (x > canvasContainerScrollLeft + canvasContainerWidth)
        canvasContainerScrollLeft = x + 10 - canvasContainerWidth;
    if (y < canvasContainerScrollTop)
        canvasContainerScrollTop = y - 10;
    if (y > canvasContainerScrollTop + canvasContainerHeight)
        canvasContainerScrollTop = y + 10 - canvasContainerHeight;
}


//var div = document.getElementById("canvas-container");
//div.height = 700;

//Create canvas with the device resolution.
//var myCanvas = createHiDPICanvas(500, 250);
//Create canvas with a custom resolution.
//var myCustomCanvas = createHiDPICanvas(500, 200, 4);


var sLineColor = "#000000"; //"#303030";
var nLineWidth = 0.75;
var nMultipleNodeOffset = 4;
var nShadowOffset = 4;
var sShadowColor = "#B0B0B0"; //"#C0C0C0"; "#C8C8C8";
//var sSelectedShadowColor = "#3030C0"; //"#FFFFB0";

var sNodeNameFont = "bold 10pt Arial"; //"bold 10pt Helvetica";"10pt Arial"
var sNodeNameColor = "#000090"; //"#303030";
var sNodeBackgroundColor = "#FFFFFF";
var sSelectedNodeBackgroundColor = "#FFFFA0"; //"#E0E0FF"; //"#FFFFB0";
var sMandatoryAttributeNameFont = "bold 11px Arial";
var sOptionalAttributeNameFont = "11px Arial";
var sAttributeNameColor = "#000080";
var nAttributeVerPadding = 3;
var nAttributeLineHeight = 13;
var sTypeDescriptionFont = "bold 11px Arial";
var sAnnotationFont = "11px Arial";
var sAnnotationColor = "#000000"; //"black"
var nAnnotationTextHeight = 10;
var nAnnotationLineDistance = 3;
var nMaxAnnotationWidth = 250;
var nAnnotationDistance = 6;  // vertical distance to border of node

var nNodeTextHeight = 10;
var nNodeTextPadding = 7;
var nNodeHeight = nNodeTextHeight + nNodeTextPadding * 2;
var nHalfNodeHeight = nNodeHeight / 2;
var nSequenceWidth = nNodeHeight * 1.5;
var nSequenceHeight = Math.round(nNodeHeight * 0.833);  // 0.75
var nSequenceCornerSize = Math.round(nSequenceHeight * 0.26);  // 0.28

var sPointsColor = "#606060"; //"#303030";
var nPointsDistance = 6;
var nPointsSize = 4;
var nPointsHalfSize = 2;

var sSequenceBoxColor = "#606060";

var nExpanderHalfSize = nSequenceCornerSize;
var nExpanderSize = nExpanderHalfSize * 2;
var nExpanderDistance = nExpanderHalfSize * 0.28;  //0.333;
//var sPlusMinusColor = "#B000A0"; //"#e00000";
//var nPlusMinusLineWidth = 0.85;
var sArrowBackgroundColor = "#787878"; //"#808080"; //"#6060B0";
var sArrowBorderColor = "#404040";
var sArrowColor = "#B000A0";
var nArrowLineWidth = 2.0;

var nMinHorLineLength = 20;
var nVerNodeDistance = 12;

var sTextDelimeters = " .,;:-+*/=<>()&%$§\"!#'[]{}´`~^°";

var nLastClickedNodeIndex;
var nLastExpandedNodeIndex;
var nLastCollapsedNodeIndex;

var bShowAnnotations = true;
var bShowTypeInfo = true;

var cbAnnotations = document.getElementById("cbAnnotations");
var cbTypeInfo = document.getElementById("cbTypeInfo");


function AnnotationChanged() {
    bShowAnnotations = cbAnnotations.checked;
    SetVerNodePositions();
    DrawTree();
}

function TypeInfoChanged() {
    bShowTypeInfo = cbTypeInfo.checked;
    SetVerNodePositions();
    DrawTree();
}


function DrawExpander(ctx, px, py, bExpanded) {
    var left = px - nExpanderHalfSize;
    var right = px + nExpanderHalfSize;
    var top = py - nExpanderHalfSize;
    var bottom = py + nExpanderHalfSize;

    // clear background
    //ctx.clearRect(left, top, nExpanderSize, nExpanderSize);
    ctx.beginPath();
    ctx.fillStyle = sArrowBackgroundColor; //sNodeBackgroundColor; //"#FFFFFF";
    ctx.fillRect(left, top, nExpanderSize, nExpanderSize);
    ctx.stroke();

    // draw border square
    ctx.beginPath();
    ctx.lineWidth = nLineWidth;
    ctx.strokeStyle = sArrowBorderColor; //"#404040"; //sLineColor; //"black";
    ctx.rect(left - 0.5, top - 0.5, nExpanderSize + 1, nExpanderSize + 1);
    ctx.stroke();

    if (bExpanded) {
        // draw left arrow
        ctx.beginPath();
        ctx.fillStyle = sNodeBackgroundColor;
        //ctx.lineWidth = nArrowLineWidth;
        //ctx.strokeStyle = sArrowColor;
        ctx.moveTo(px + 2, top + 1.5);
        ctx.lineTo(px - 3, py);
        ctx.lineTo(px + 2, bottom - 1.5);
        //ctx.stroke();
        ctx.fill();
    } else {
        // draw right arrow
        ctx.beginPath();
        ctx.fillStyle = sNodeBackgroundColor;
        //ctx.lineWidth = nArrowLineWidth;
        //ctx.strokeStyle = sArrowColor;
        ctx.moveTo(px - 2, top + 1.5);
        ctx.lineTo(px + 3, py);
        ctx.lineTo(px - 2, bottom - 1.5);
        //ctx.stroke();
        ctx.fill();
    }

    /*
    // draw minus sign (horizontal line)
    ctx.beginPath();
    ctx.lineWidth = nPlusMinusLineWidth;
    ctx.strokeStyle = sPlusMinusColor; //"#e00000"; //"red"; "blue";
    ctx.moveTo(left + nExpanderDistance, py);
    ctx.lineTo(right + 0.2 - nExpanderDistance, py);
    ctx.stroke();
    if (!bExpanded) {
    // draw vertical line for plus sign
    ctx.beginPath();
    ctx.moveTo(px, top + nExpanderDistance);
    ctx.lineTo(px, bottom + 0.2 - nExpanderDistance);
    ctx.stroke();
    }
    */
}


function DrawAttrExpander(ctx, px, py, bExpanded) {
    var left = px - nExpanderHalfSize;
    var right = px + nExpanderHalfSize;
    var top = py - nExpanderHalfSize;
    var bottom = py + nExpanderHalfSize;

    // clear background
    //ctx.clearRect(left, top, nExpanderSize, nExpanderSize);
    ctx.beginPath();
    ctx.fillStyle = sArrowBackgroundColor;
    ctx.fillRect(left, top, nExpanderSize, nExpanderSize);
    ctx.stroke();

    // draw border square
    ctx.beginPath();
    ctx.lineWidth = nLineWidth;
    ctx.strokeStyle = sArrowBorderColor;
    ctx.rect(left - 0.5, top - 0.5, nExpanderSize + 1, nExpanderSize + 1);
    ctx.stroke();

    if (bExpanded) {
        // draw up arrow
        ctx.beginPath();
        ctx.fillStyle = sNodeBackgroundColor;
        //ctx.lineWidth = nArrowLineWidth;
        //ctx.strokeStyle = sArrowColor;
        ctx.moveTo(left + 1.5, py + 2);
        ctx.lineTo(px, py - 3);
        ctx.lineTo(right - 1.5, py + 2);
        //ctx.stroke();
        ctx.fill();
    } else {
        // draw down arrow
        ctx.beginPath();
        ctx.fillStyle = sNodeBackgroundColor;
        //ctx.lineWidth = nArrowLineWidth;
        //ctx.strokeStyle = sArrowColor;
        ctx.moveTo(left + 1.5, py - 2);
        ctx.lineTo(px, py + 3);
        ctx.lineTo(right - 1.5, py - 2);
        //ctx.stroke();
        ctx.fill();
    }
}


function DrawSizeRuler(ctx, x, y, n) {
    var len;
    var xx = x;

    ctx.lineWidth = 0.25;
    ctx.strokeStyle = "black";

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + n * 2, y);
    ctx.stroke();

    for (i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.moveTo(xx, y);
        len = 3;
        if (i % 5 == 0) len = 5;
        if (i % 10 == 0) len = 8;
        ctx.lineTo(xx, y + len);
        ctx.stroke();
        xx += 2;
    }
}


function DrawAnnotation(ctx, nodeIndex) {
    var node = Nodes[nodeIndex];
    var y = node.bottom + nAnnotationDistance;

    if (node.maxOccurs > 1 || node.maxOccurs < 0)
        y += nMultipleNodeOffset;

    /*
    var annotation = nodeIndex;
    if (node.annotation)
    annotation += ' ' + node.annotation;
    */
    var annotation = node.annotation;

    if (node.typeDescription && bShowTypeInfo) {
        //ctx.clearRect(node.left - 10, y - 1, node.totalWidth + 10, nAnnotationTextHeight + 5);
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.font = sTypeDescriptionFont;
        ctx.fillStyle = sAnnotationColor;
        ctx.fillText(node.typeDescription, node.left, y + nAnnotationTextHeight);
        ctx.stroke();
        y += nAnnotationTextHeight + nAnnotationLineDistance;
    }

    if (annotation && bShowAnnotations) {
        /*
        ctx.clearRect(node.left - 10, y - 1, 500 / *node.totalWidth* /, nAnnotationTextHeight + 5);
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.font = sAnnotationFont;
        ctx.fillStyle = sAnnotationColor;
        ctx.fillText(annotation, node.left, y + nAnnotationTextHeight);
        ctx.stroke();
        */
        for (i = 0; i < Nodes[nodeIndex].annotationLines.length; i++) {
            ctx.beginPath();
            //ctx.strokeStyle = "black";
            ctx.font = sAnnotationFont;
            ctx.fillStyle = sAnnotationColor;
            ctx.fillText(Nodes[nodeIndex].annotationLines[i], node.left, y + nAnnotationTextHeight);
            ctx.stroke();
            y += nAnnotationTextHeight + nAnnotationLineDistance;
        }
    }
}


function DrawOctagonShape(ctx, left, top, width, height, corner) {
    var right = left + width;
    var bottom = top + height;

    ctx.moveTo(left + corner, top);
    ctx.lineTo(right - corner, top);
    ctx.lineTo(right, top + corner);
    ctx.lineTo(right, bottom - corner);
    ctx.lineTo(right - corner, bottom);
    ctx.lineTo(left + corner, bottom);
    ctx.lineTo(left, bottom - corner);
    ctx.lineTo(left, top + corner);
    ctx.lineTo(left + corner, top);
}


function DrawOctagonWithShadow(ctx, nodeIndex) {
    var node = Nodes[nodeIndex];

    ctx.beginPath();
    ctx.fillStyle = sShadowColor;
    DrawOctagonShape(ctx, node.left + nShadowOffset, node.top + nShadowOffset, nSequenceWidth, nSequenceHeight, nSequenceCornerSize);
    ctx.fill();

    ctx.beginPath();
    if (nodeIndex == nLastClickedNodeIndex)
        ctx.fillStyle = sSelectedNodeBackgroundColor;
    else
        ctx.fillStyle = sNodeBackgroundColor;
    DrawOctagonShape(ctx, node.left, node.top, nSequenceWidth, nSequenceHeight, nSequenceCornerSize);
    ctx.fill();

    ctx.beginPath();
    ctx.lineWidth = nLineWidth;
    ctx.strokeStyle = sLineColor; //"black";
    DrawOctagonShape(ctx, node.left, node.top, nSequenceWidth, nSequenceHeight, nSequenceCornerSize);
    ctx.stroke();
}


function DrawPoints(ctx, nodeIndex) {
    var node = Nodes[nodeIndex];
    var xx = node.right + nPointsDistance * 2;  // + nMinHorLineLength;
    var yy = node.verCenter - nPointsHalfSize;

    ctx.fillStyle = sPointsColor;

    for (i = 4; i > 0; i--) {
        ctx.beginPath();
        ctx.fillRect(xx, yy, nPointsSize, nPointsSize);
        ctx.stroke();
        xx += nPointsSize + nPointsDistance;
    }
}


function DrawSequenceNode(ctx, nodeIndex) {
    var node = Nodes[nodeIndex];
    var right = node.right;

    DrawOctagonWithShadow(ctx, nodeIndex);

    var dx = nSequenceWidth / 7;
    var yy = node.verCenter;

    var d = dx * 0.40;
    var dd = d * 2;
    var xx = node.left + dx * 2;

    ctx.fillStyle = sLineColor; //"black";
    ctx.beginPath();
    ctx.arc(xx, yy, d, 0, 2 * Math.PI);
    ctx.stroke();

    xx += dx * 1.5;
    ctx.beginPath();
    ctx.arc(xx, yy, d, 0, 2 * Math.PI);
    ctx.stroke();

    xx += dx * 1.5;
    ctx.beginPath();
    ctx.arc(xx, yy, d, 0, 2 * Math.PI);
    ctx.stroke();

    DrawAnnotation(ctx, nodeIndex);

    if (node.firstChildIndex) {
        DrawExpander(ctx, node.expHorCenter, node.verCenter, node.expanded);
        right += nExpanderSize;
    }

    return right;
}


function DrawChoiceNode(ctx, nodeIndex) {
    var node = Nodes[nodeIndex];
    var right = node.right;

    DrawOctagonWithShadow(ctx, nodeIndex);

    var dx = nSequenceWidth / 6;
    var dx2 = dx * 0.66;
    var xx = node.left + dx;
    var dy = Math.round(nSequenceHeight / 5) + 0.5;
    var yy = node.verCenter;
    var top2 = yy - dy;
    var bottom2 = yy + dy;

    ctx.beginPath();
    ctx.moveTo(xx, yy);
    xx += dx;
    ctx.lineTo(xx, yy);
    xx += dx;
    ctx.lineTo(xx, top2 + 0.5);
    ctx.stroke();

    var d = dx * 0.33;
    var dd = d * 2;

    xx += dx - 1;
    ctx.fillStyle = sLineColor;
    ctx.beginPath();
    ctx.arc(xx, top2 - 1, d, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(xx + dx2 - 0.5, yy, d, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(xx, bottom2 + 1, d, 0, 2 * Math.PI);
    ctx.stroke();

    DrawAnnotation(ctx, nodeIndex);

    if (node.firstChildIndex) {
        DrawExpander(ctx, node.expHorCenter, node.verCenter, node.expanded);
        right += nExpanderSize;
    }

    return right;
}


/*
Nodes[0].left = x;
Nodes[0].top = y;
Nodes[0].right = x + nNodeWidth;
Nodes[0].bottom = y + nNodeHeight;
Nodes[0].width = nNodeWidth;
Nodes[0].verCenter = y + nHalfNodeHeight;
Nodes[0].name = "FundsXML4";
Nodes[0].annotation = "Root element of FundsXML 4.0 schema";
Nodes[0].expanded = true;
*/

function DrawElementNode(ctx, nodeIndex) {
    var node = Nodes[nodeIndex];
    //var nNodeWidth = node.right - node.left;
    //var nNodeHeight = node.bottom - node.top;
    var right = node.right;
    var rectLeft = node.left + 0.5;
    var rectTop = node.top + 0.5;
    var rectHeight = node.height - 0.5; //nNodeHeight
    var rectWidth = node.width - 0.5;

    if (node.maxOccurs > 1 || node.maxOccurs < 0) {
        // draw shadow
        ctx.beginPath();
        ctx.fillStyle = sShadowColor;
        ctx.fillRect(node.left + nMultipleNodeOffset + nShadowOffset, node.top + nMultipleNodeOffset + nShadowOffset, node.width + 0.5, node.height);
        ctx.stroke();

        // draw background for main node rectangle
        ctx.beginPath();
        ctx.fillStyle = sNodeBackgroundColor; //"#FFFFFF";
        ctx.fillRect(rectLeft + nMultipleNodeOffset, rectTop + nMultipleNodeOffset, node.width, node.height);
        ctx.stroke();

        // draw main node rectangle
        ctx.beginPath();
        ctx.lineWidth = nLineWidth;
        ctx.strokeStyle = sLineColor; //"black";
        if (node.minOccurs == 0)
            ctx.setLineDash([4, 4]);  // [5,3] ... dashes are 5px and spaces are 3px
        ctx.rect(rectLeft + nMultipleNodeOffset, rectTop + nMultipleNodeOffset, rectWidth, rectHeight);
        ctx.stroke();
    } else {
        // draw shadow
        ctx.beginPath();
        /*if (nodeIndex == nLastClickedNodeIndex)
        ctx.fillStyle = sSelectedShadowColor;
        else*/
        ctx.fillStyle = sShadowColor;
        ctx.fillRect(node.left + nShadowOffset, node.top + nShadowOffset, node.width + 0.5, node.height);
        ctx.stroke();
    }

    // draw background for main node rectangle
    ctx.beginPath();
    if (nodeIndex == nLastClickedNodeIndex)
        ctx.fillStyle = sSelectedNodeBackgroundColor;
    else
        ctx.fillStyle = sNodeBackgroundColor; //"#FFFFFF";
    ctx.fillRect(rectLeft, rectTop, node.width, node.height);
    ctx.stroke();

    // draw main node rectangle
    ctx.beginPath();
    ctx.lineWidth = nLineWidth;
    ctx.strokeStyle = sLineColor; //"black";
    if (node.minOccurs == 0)
        ctx.setLineDash([4, 4]);  // [5,3] ... dashes are 5px and spaces are 3px
    ctx.rect(rectLeft, rectTop, rectWidth, rectHeight);
    ctx.stroke();

    ctx.setLineDash([]);
    //ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.font = sNodeNameFont; //"10pt Arial";
    ctx.fillStyle = sNodeNameColor; //"black";
    ctx.fillText(node.name, node.left + nNodeTextPadding, node.top + nNodeTextHeight + nNodeTextPadding);
    ctx.stroke();

    if (Nodes[nodeIndex].attributes) {
        var i, yy = node.top + nNodeTextHeight + nNodeTextPadding * 2;
        if (node.showAttributes) {
            DrawLine(ctx, rectLeft, yy, node.right, yy);
            //DrawAttrExpander(ctx, node.right - nExpanderSize, yy, node.showAttributes);
            yy += nAttributeVerPadding;
            for (i = 0; i < Nodes[nodeIndex].attributes.length; i++) {
                ctx.beginPath();
                if (node.attributes[i].use == "required")
                    ctx.font = sMandatoryAttributeNameFont;
                else
                    ctx.font = sOptionalAttributeNameFont;
                ctx.fillStyle = sAttributeNameColor;
                ctx.fillText(node.attributes[i].name, node.left + nNodeTextPadding, yy + nNodeTextHeight);
                ctx.stroke();
                yy += nAttributeLineHeight;
            }
        } else
            DrawAttrExpander(ctx, node.right - nExpanderSize, yy, node.showAttributes);
    }

    // typeDescription

    DrawAnnotation(ctx, nodeIndex);

    if (node.firstChildIndex) {
        DrawExpander(ctx, node.right, node.verCenter, node.expanded);
        right += nExpanderHalfSize;
    } else {
        if (node.recursiveType || node.typeName == "xs:anyType" || node.baseTypeName == "xs:anyType")
            DrawPoints(ctx, nodeIndex);
    }

    return right;
}


function DrawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.lineWidth = nLineWidth;
    ctx.strokeStyle = sLineColor; //"black";
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}


function IsMultiple(maxOccurs) {
    return (maxOccurs > 1 || maxOccurs < 0);
}


function SetNodeSize(ctx, nodeIndex, recursive) {
    var typeWidth = 0;
    var annotationWidth = 0;

    //if (Nodes[nodeIndex].type == NodeTypeChoice || Nodes[nodeIndex].type == NodeTypeSequence) {
    if (!IsRealNode(Nodes[nodeIndex].type)) {
        Nodes[nodeIndex].height = nSequenceHeight;
        Nodes[nodeIndex].width = nSequenceWidth;
    } else {
        var height = nNodeHeight;
        ctx.font = sNodeNameFont;
        var width = ctx.measureText(Nodes[nodeIndex].name).width + nNodeTextPadding * 2;

        if (Nodes[nodeIndex].firstChildIndex)
            width += nExpanderHalfSize;

        if (Nodes[nodeIndex].attributes) {
            width += nExpanderSize;
            if (Nodes[nodeIndex].showAttributes) {
                var i, width2 = 0;
                for (i = 0; i < Nodes[nodeIndex].attributes.length; i++) {
                    if (Nodes[nodeIndex].attributes[i].use == "required")
                        ctx.font = sMandatoryAttributeNameFont;
                    else
                        ctx.font = sOptionalAttributeNameFont;
                    width2 = Math.max(width2, ctx.measureText(Nodes[nodeIndex].attributes[i].name).width);
                }
                height += Nodes[nodeIndex].attributes.length * nAttributeLineHeight + nAttributeVerPadding * 2;
                width = Math.max(width, width2 + nNodeTextPadding * 2);
            }
        }

        Nodes[nodeIndex].height = Math.round(height);
        Nodes[nodeIndex].width = Math.round(width);
    }

    var sText = Nodes[nodeIndex].typeDescription;
    if (sText && sText.length > 0) {
        ctx.font = sTypeDescriptionFont;
        typeWidth = ctx.measureText(sText).width;
    }

    sText = Nodes[nodeIndex].annotation;
    if (sText && sText.length > 0) {
        ctx.font = sAnnotationFont;
        var totalTextWidth = ctx.measureText(sText).width;
        var annotationLines = new Array();
        var nChars = 0, nPartWidth = 0, nChars2 = 0, nPartWidth2 = 0;
        var sPart = "", sPart2 = "", chr = " ";

        while (totalTextWidth > nMaxAnnotationWidth) {
            nChars = Math.round((sText.length * nMaxAnnotationWidth) / totalTextWidth);
            sPart = sText.substr(0, nChars);
            nPartWidth = ctx.measureText(sPart).width;

            // find longest part of text fitting into maximum width
            if (nPartWidth < nMaxAnnotationWidth) {
                nChars2 = nChars + 1;
                sPart2 = sText.substr(0, nChars2);
                nPartWidth2 = ctx.measureText(sPart2).width;
                while (nPartWidth2 <= nMaxAnnotationWidth) {
                    nChars = nChars2;
                    sPart = sPart2;
                    nPartWidth = nPartWidth2;
                    nChars2 = nChars + 1;
                    sPart2 = sText.substr(0, nChars2);
                    nPartWidth2 = ctx.measureText(sPart2).width;
                }
            }

            if (nPartWidth > nMaxAnnotationWidth) {
                nChars2 = nChars - 1;
                sPart2 = sText.substr(0, nChars2);
                nPartWidth2 = ctx.measureText(sPart2).width;
                while (nPartWidth2 > nMaxAnnotationWidth) {
                    nChars = nChars2;
                    sPart = sPart2;
                    nPartWidth = nPartWidth2;
                    nChars2 = nChars - 1;
                    sPart2 = sText.substr(0, nChars2);
                    nPartWidth2 = ctx.measureText(sPart2).width;
                }
            }

            // search for delimiter
            nChars2 = nChars;
            chr = sText.substr(nChars, 1);
            while (nChars2 > 10 && sTextDelimeters.indexOf(chr) < 0) {
                nChars2--;
                chr = sText.substr(nChars2, 1);
            }

            if (sTextDelimeters.indexOf(chr) >= 0) {
                // cut at delimiter
                sPart = sText.substr(0, nChars2);
                annotationLines.push(sPart);
                sText = sText.substr(nChars2 + 1, 999);
            } else {
                // cut at maximum and insert minus sign
                nChars2 = nChars - 1;
                sPart = sText.substr(0, nChars2) + "-";
                annotationLines.push(sPart);
                sText = sText.substr(nChars2, 999);
            }

            totalTextWidth = ctx.measureText(sText).width;
        }

        annotationLines.push(sText);

        for (i = 0; i < annotationLines.length; i++)
            annotationWidth = Math.max(annotationWidth, ctx.measureText(annotationLines[i]).width);

        Nodes[nodeIndex].annotationLines = annotationLines;
        Nodes[nodeIndex].footerHeight = Math.round((nAnnotationTextHeight + nAnnotationLineDistance) * annotationLines.length);
    } else {
        Nodes[nodeIndex].footerHeight = 0;
        Nodes[nodeIndex].footerWidth = 0;
    }

    Nodes[nodeIndex].footerWidth = Math.round(Math.max(typeWidth, annotationWidth));

    var totalHeight = Nodes[nodeIndex].height + Nodes[nodeIndex].footerHeight;

    if (IsMultiple(Nodes[nodeIndex].maxOccurs))
        totalHeight += nMultipleNodeOffset;

    if (Nodes[nodeIndex].typeDescription)
        totalHeight += nAnnotationTextHeight + nAnnotationLineDistance;

    if (totalHeight > 0)
        totalHeight += nAnnotationDistance - nAnnotationLineDistance;

    Nodes[nodeIndex].totalHeight = totalHeight;

    if (recursive) {
        var nextNodeIndex = Nodes[nodeIndex].firstChildIndex;

        while (nextNodeIndex) {
            SetNodeSize(ctx, nextNodeIndex, recursive);
            nextNodeIndex = Nodes[nextNodeIndex].nextIndex;
        }
    }
}


function CurrentTotalHeight(nodeIndex) {
    var bAddBaseDistance = false;
    var totalHeight = Nodes[nodeIndex].height;

    if (IsMultiple(Nodes[nodeIndex].maxOccurs))
        totalHeight += nMultipleNodeOffset;

    if (Nodes[nodeIndex].typeDescription && bShowTypeInfo) {
        totalHeight += nAnnotationTextHeight + nAnnotationLineDistance;
        bAddBaseDistance = true;
    }

    if (Nodes[nodeIndex].annotation && bShowAnnotations) {
        totalHeight += Nodes[nodeIndex].footerHeight;
        bAddBaseDistance = true;
    }

    if (bAddBaseDistance)
        totalHeight += nAnnotationDistance - nAnnotationLineDistance;

    return totalHeight;
}


function SetNodeSizes() {
    var canvas = document.getElementById("tree");
    var ctx = canvas.getContext("2d");

    ctx.font = sNodeNameFont;
    SetNodeSize(ctx, rootNodeIndex, true);
}


function GetTreeHeight(nodeIndex) {
    var nodeHeight = CurrentTotalHeight(nodeIndex); //Nodes[nodeIndex].totalHeight;
    var childrenHeight = 0 - nVerNodeDistance;
    var result = nodeHeight;

    if (Nodes[nodeIndex].expanded) {
        var nextNodeIndex = Nodes[nodeIndex].firstChildIndex;

        while (nextNodeIndex) {
            childrenHeight += GetTreeHeight(nextNodeIndex) + nVerNodeDistance;
            nextNodeIndex = Nodes[nextNodeIndex].nextIndex;
        }
    }

    if (childrenHeight > 0) {
        Nodes[nodeIndex].childrenHeight = childrenHeight;
        result = childrenHeight;
    }

    return result;
}


function SetVerNodePosition(nodeIndex, y) {
    var verPosition = y;
    var nHalfHeight = Nodes[nodeIndex].height / 2;
    var firstChildIndex = Nodes[nodeIndex].firstChildIndex;

    if (firstChildIndex && Nodes[nodeIndex].expanded) {
        var nextNodeIndex = firstChildIndex;
        var previousNodeIndex;
        var childNodes = 0;

        while (nextNodeIndex) {
            childNodes++;
            verPosition = SetVerNodePosition(nextNodeIndex, verPosition);
            previousNodeIndex = nextNodeIndex;
            nextNodeIndex = Nodes[nextNodeIndex].nextIndex;
        }

        Nodes[nodeIndex].verCenter = Math.round((Nodes[firstChildIndex].verCenter + Nodes[previousNodeIndex].verCenter) / 2);
        Nodes[nodeIndex].top = Nodes[nodeIndex].verCenter - nHalfHeight;
        Nodes[nodeIndex].bottom = Nodes[nodeIndex].top + Nodes[nodeIndex].height;

        verPosition = Math.max(verPosition, Nodes[nodeIndex].top + CurrentTotalHeight(nodeIndex)/*Nodes[nodeIndex].totalHeight*/ + nVerNodeDistance);
    } else {
        Nodes[nodeIndex].top = y;
        Nodes[nodeIndex].verCenter = y + nHalfHeight;
        Nodes[nodeIndex].bottom = y + Nodes[nodeIndex].height;
        verPosition += CurrentTotalHeight(nodeIndex)/*Nodes[nodeIndex].totalHeight*/ + nVerNodeDistance;
        nSchemaWidth = Math.max(nSchemaWidth, Nodes[nodeIndex].left + Nodes[nodeIndex].totalWidth);
    }

    return verPosition;
}


function SetVerNodePositions() {
    nSchemaHeight = 0;
    nSchemaWidth = 0;

    nSchemaHeight = SetVerNodePosition(rootNodeIndex, nSchemaBorder);
}


function ChildNodeCount(nodeIndex) {
    var result = 0;
    var nextNodeIndex = Nodes[nodeIndex].firstChildIndex;

    while (nextNodeIndex) {
        result++;
        nextNodeIndex = Nodes[nextNodeIndex].nextIndex;
    }

    return result;
}


function SetHorNodePosition(nodeIndex, x, recursive, visible) {
    var nodeType = Nodes[nodeIndex].type;
    var firstChildIndex = Nodes[nodeIndex].firstChildIndex;

    Nodes[nodeIndex].left = x;
    var width = Nodes[nodeIndex].width;
    var right = x + width;
    Nodes[nodeIndex].right = right;
    Nodes[nodeIndex].expHorCenter = -999;
    Nodes[nodeIndex].visible = visible;

    if (firstChildIndex)
        if (nodeType == NodeTypeChoice || nodeType == NodeTypeSequence) {
            Nodes[nodeIndex].expHorCenter = right + nExpanderHalfSize;
            width += nExpanderSize;
        } else {
            Nodes[nodeIndex].expHorCenter = right;
            width += nExpanderHalfSize;
        }

    Nodes[nodeIndex].totalWidth = Math.max(width + nMinHorLineLength, Nodes[nodeIndex].footerWidth - nSequenceWidth);

    if ((nodeType == NodeTypeChoice || nodeType == NodeTypeSequence) && ChildNodeCount(nodeIndex) > 1)
        Nodes[nodeIndex].totalWidth += nMinHorLineLength;

    var nextHorPos = x + Nodes[nodeIndex].totalWidth;

    //if (Nodes[nodeIndex].expanded) {
    var nextNodeIndex = firstChildIndex;
    var childrenVisible = visible && Nodes[nodeIndex].expanded;

    while (nextNodeIndex) {
        SetHorNodePosition(nextNodeIndex, nextHorPos, recursive, childrenVisible);
        nextNodeIndex = Nodes[nextNodeIndex].nextIndex;
    }
    //}
}


function CalcNodePositions() {
    nSchemaHeight = 0;
    nSchemaWidth = 0;

    // Calculate height of all visible nodes including their visible child nodes
    GetTreeHeight(rootNodeIndex);

    // Calculate vertical position of all visible nodes
    SetVerNodePositions();

    // Calculate horizontal position of all visible nodes
    SetHorNodePosition(rootNodeIndex, nSchemaBorder, true);

}


function DrawNode(ctx, nodeIndex, recursive) {
    var node = Nodes[nodeIndex];
    var nodeName = node.name;
    var nodeType = node.type;
    var right = node.right;

    if (nodeType == NodeTypeChoice)
        right = DrawChoiceNode(ctx, nodeIndex);
    else if (nodeType == NodeTypeSequence)
        right = DrawSequenceNode(ctx, nodeIndex);
    else
        right = DrawElementNode(ctx, nodeIndex);

    if (recursive && node.expanded) {
        var childNodes = ChildNodeCount(nodeIndex);
        var nextNodeIndex = node.firstChildIndex;
        var x = node.left + node.totalWidth;
        var y1 = node.verCenter;
        var y2 = node.verCenter;
        if (childNodes > 1)
            x -= nMinHorLineLength;
        DrawLine(ctx, right, node.verCenter, x, node.verCenter);

        while (nextNodeIndex) {
            if (childNodes > 1) {
                var y = Nodes[nextNodeIndex].verCenter;
                DrawLine(ctx, x, y, Nodes[nextNodeIndex].left, y);
                y1 = Math.min(y1, y);
                y2 = Math.max(y2, y);
            }
            DrawNode(ctx, nextNodeIndex, recursive);
            nextNodeIndex = Nodes[nextNodeIndex].nextIndex;
        }

        if (childNodes > 1)
            DrawLine(ctx, x, y1, x, y2);
    }
}


function GetMaxChildWidth(nodeIndex) {
    var result = 0;
    var nextNodeIndex = Nodes[nodeIndex].firstChildIndex;

    while (nextNodeIndex) {
        result = Math.max(result, Nodes[nextNodeIndex].totalWidth);
        nextNodeIndex = Nodes[nextNodeIndex].nextIndex;
    }

    return result;
}


function ExpandChoiceNodes(nodeIndex) {
    var nextNodeIndex = Nodes[nodeIndex].firstChildIndex;

    while (nextNodeIndex) {
        if (Nodes[nextNodeIndex].type == NodeTypeChoice)
            Nodes[nextNodeIndex].expanded = true;
        nextNodeIndex = Nodes[nextNodeIndex].nextIndex;
    }
}


function MakeVisibleAndUpdate(x, y) {
    canvasContainerScrollLeft = canvasContainer.scrollLeft; //.scrollLeftMax
    canvasContainerScrollTop = canvasContainer.scrollTop; //.scrollTopMax

    MakeVisible(x, y);

    canvasContainer.scrollLeft = Math.min(canvasContainerScrollLeft, canvas.width - canvasContainerWidth);
    canvasContainer.scrollTop = Math.min(canvasContainerScrollTop, canvas.height - canvasContainerHeight);
}


function MoveNodeToCenter(nodeIndex) {
    canvasContainerScrollLeft = Nodes[nodeIndex].left + Nodes[nodeIndex].width - canvasContainerWidth * 0.8;
    canvasContainerScrollTop = Nodes[nodeIndex].top + Nodes[nodeIndex].height - canvasContainerHeight * 0.5;

    canvasContainer.scrollLeft = Math.max(Math.min(canvasContainerScrollLeft, canvas.width - canvasContainerWidth), 0);
    canvasContainer.scrollTop = Math.max(Math.min(canvasContainerScrollTop, canvas.height - canvasContainerHeight), 0);
}


function DrawTree() {
    // set height of canvas container to window height (= full screen)
    var canvasHeight = window.innerHeight - (schemaOptions.offsetHeight + searchResultDiv.offsetHeight + bottomLineParagraph.offsetHeight);
    canvasContainer.style.height = canvasHeight + "px"; //document.offsetHeight;
    // make complete canvas container visible
    //document.body.scrollTop = canvasContainer.offsetTop + 1;
    document.body.scrollTop = schemaOptions.offsetTop + 1;

    canvasContainerWidth = canvasContainer.clientWidth;
    canvasContainerHeight = canvasContainer.clientHeight;

    //var canvas = document.getElementById("tree");
    var ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //DrawSizeRuler(ctx, 5, 5, 50);

    DrawNode(ctx, rootNodeIndex, true);

    // make sure last clicked/expanded node is visible
    canvasContainerScrollLeft = canvasContainer.scrollLeft; //.scrollLeftMax
    canvasContainerScrollTop = canvasContainer.scrollTop; //.scrollTopMax

    if (nSchemaWidth <= canvasContainerWidth) {
        canvasContainerScrollLeft = 0;
        canvasContainer.scrollLeft = canvasContainerScrollLeft;
    }

    if (nSchemaHeight <= canvasContainerHeight) {
        canvasContainerScrollTop = 0;
        canvasContainer.scrollTop = canvasContainerScrollTop;
    }

    if (nLastClickedNodeIndex) {
        if (nLastExpandedNodeIndex) {
            var maxChildWidth = GetMaxChildWidth(nLastExpandedNodeIndex) + 40;
            var halfTreeHeight = Math.min(GetTreeHeight(nLastExpandedNodeIndex), canvasContainerHeight) / 2;
            //var halfTreeHeight = Math.min(Nodes[nLastExpandedNodeIndex].childrenHeight, canvasContainerHeight) / 2;
            var x = Nodes[nLastExpandedNodeIndex].left + Nodes[nLastExpandedNodeIndex].totalWidth + maxChildWidth;
            MakeVisible(x, Nodes[nLastExpandedNodeIndex].verCenter + halfTreeHeight + 80);
            MakeVisible(x, Nodes[nLastExpandedNodeIndex].verCenter - halfTreeHeight);
            nLastExpandedNodeIndex = null;
        }
        if (nLastCollapsedNodeIndex) {
            var x = Nodes[nLastClickedNodeIndex].left + Nodes[nLastClickedNodeIndex].totalWidth - canvasContainerWidth * 0.8;
            MakeVisible(x, Nodes[nLastClickedNodeIndex].top - canvasContainerHeight * 0.5);
            MakeVisible(x, Nodes[nLastClickedNodeIndex].top + CurrentTotalHeight(nLastClickedNodeIndex)/*Nodes[nLastClickedNodeIndex].totalHeight*/ + 80);
            nLastCollapsedNodeIndex = null;
        }

        MakeVisible(Nodes[nLastClickedNodeIndex].left, Nodes[nLastClickedNodeIndex].top);

        canvasContainer.scrollLeft = Math.min(canvasContainerScrollLeft, canvas.width - canvasContainerWidth);
        canvasContainer.scrollTop = Math.min(canvasContainerScrollTop, canvas.height - canvasContainerHeight);
    }

    /*
    var container = document.getElementById("canvas-container");
    var rect = canvas.getBoundingClientRect();  // 10/48/10012/5050

    var scrollTop = container.scrollTop;
    tracePar.innerHTML = "BoundingClientRect=" + rect.left + "/" + rect.top;
    tracePar.innerHTML = tracePar.innerHTML + "/" + rect.right + "/" + rect.bottom;
    tracePar.innerHTML = tracePar.innerHTML + " ,  ScrollPosition=" + container.scrollLeft + "/" + container.scrollTop;
    tracePar.innerHTML = tracePar.innerHTML + " ,  ContainerSize=" + container.clientWidth + "/" + container.clientHeight;
    // ContainerSize=1228/733
    tracePar.innerHTML = tracePar.innerHTML + " ,  CanvasSize=" + canvas.clientWidth + "/" + canvas.clientHeight;

    if (nLastClickedNodeIndex) {
    var node = Nodes[nLastClickedNodeIndex];
    tracePar.innerHTML = tracePar.innerHTML + " ,  LastClickedNode=" + node.left + "/" + node.top + "/" + node.right + "/" + node.bottom;
    }
    // BoundingClientRect=-1264/-1296.5/1238/1205.5 , ScrollPosition=1274/1275.5 , ContainerSize=1228/733 ,
    // CanvasSize=2500/2500 , LastClickedNode=2358/1772/2458/1796

    //window.scrollTo(300, 500);
    */

    /*
    var x = 20.0;
    var y = 20.0;
    ctx.font = "bold 10pt Arial";
    var sText = "FundsXML4";
    var nTextHeight = nNodeTextHeight; // ctx.measureText(sText).height;
    var nTextWidth = ctx.measureText(sText).width;
    //alert("nTextWidth=" + nTextWidth + " ,  nTextHeight=" + nTextHeight);
    var nNodeWidth = Math.round(nTextWidth + nNodeTextPadding * 2 + nExpanderHalfSize);
    ctx.fillText(sText, x + nNodeTextPadding, y + nTextHeight + nNodeTextPadding);
    ctx.lineWidth = nLineWidth; // 0.75; // 0.5; // "1";
    / * if (bRootNodeExpanded)
    ctx.strokeStyle = "red";
    else * /
    ctx.strokeStyle = sLineColor; //"blue";
    ctx.rect(x + 0.5, y + 0.5, nNodeWidth - 0.5, nNodeHeight - 0.5);  // nTextHeight + nNodeTextPadding * 2 - 0.5);
    ctx.stroke();
    Nodes[0].left = x;
    Nodes[0].top = y;
    Nodes[0].right = x + nNodeWidth;
    Nodes[0].bottom = y + nNodeHeight;
    Nodes[0].width = nNodeWidth;
    Nodes[0].verCenter = y + nHalfNodeHeight;
    Nodes[0].name = "FundsXML4";
    Nodes[0].annotation = "Root element of FundsXML 4.0 schema";
    Nodes[0].expanded = true;
    var yy = Nodes[0].bottom + nNodeTextPadding;
    sText = "Root element of FundsXML 4.0 schema";
    nTextHeight = nNodeTextHeight;
    nTextWidth = ctx.measureText(sText).width;
    //alert("nTextWidth=" + nTextWidth + " ,  nTextHeight=" + nTextHeight);
    ctx.beginPath();
    ctx.strokeStyle = "black";
    //ctx.font = "8pt Arial";
    ctx.font = "11px Arial";
    ctx.fillText(sText, x, yy + nTextHeight);
    ctx.stroke();
    x += nNodeWidth;
    y += nHalfNodeHeight;
    DrawExpander(ctx, x, y, false);
    x += nExpanderHalfSize;
    var nLineLength = 50;
    / *
    ctx.beginPath();
    ctx.lineWidth = nLineWidth;
    ctx.strokeStyle = "black";
    ctx.moveTo(x, y);
    ctx.lineTo(x + nLineLength, y);
    ctx.stroke();
    * /
    DrawLine(ctx, x, y, x + nLineLength, y);
    x += nLineLength;
    DrawSequenceNode(ctx, x, y);
    x += nSequenceWidth + nExpanderHalfSize;
    DrawExpander(ctx, x, y, true);
    x += nExpanderHalfSize;
    DrawLine(ctx, x, y, x + nLineLength, y);
    x += nLineLength;
    Nodes.push({});
    Nodes[1].left = x;
    Nodes[1].top = y - nHalfNodeHeight;
    Nodes[1].right = x + nNodeWidth;
    Nodes[1].bottom = y + nHalfNodeHeight;
    Nodes[1].width = nNodeWidth;
    Nodes[1].verCenter = y;
    Nodes[1].name = "ControlData";
    Nodes[1].annotation = "Attributes of the xml document";
    Nodes[1].expanded = true;
    DrawNode(ctx, Nodes[1]);
    x += nNodeWidth + nExpanderHalfSize;
    DrawLine(ctx, x, y, x + nLineLength, y);
    x += nLineLength;
    DrawChoiceNode(ctx, x, y);
    x += nSequenceWidth + nExpanderHalfSize;
    DrawExpander(ctx, x, y, false);
    x += nExpanderHalfSize;
    */
}


function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    //console.log("x: " + x + " y: " + y);
    alert("x: " + x + " [" + Nodes[0].left + " - " + Nodes[0].right + "]  /  y: " + y + " [" + Nodes[0].top + " - " + Nodes[0].bottom + "]");
}


function getObjectAtCursor(canvas, event) {
    var result;
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    //console.log("x: " + x + " y: " + y);
    for (i = 0; i < Nodes.length; i++)
        if (x >= Nodes[i].left && x <= Nodes[i].right + nExpanderHalfSize && y >= Nodes[i].top && y <= Nodes[i].bottom + nExpanderHalfSize)
            result = i;

    return result;
}


var nodeDetails = document.getElementById('node-details');
var NodeDetailsName = document.getElementById("nd-name");
var NodeDetailsAttr = document.getElementById("nd-attr");
var NodeDetailsType = document.getElementById("nd-type");
var NodeDetailsPattern = document.getElementById("nd-pattern");
var NodeDetailsAnno = document.getElementById("nd-anno");
var NodeDetailsEnum = document.getElementById("nd-enum");
var NodeDetailsXPath = document.getElementById("nd-xpath");


function ShowNodeDetails(nodeIndex) {
    var node = Nodes[nodeIndex];
    var clientRect = canvas.getBoundingClientRect();
    var i, txt;

    var xOffset = -20;
    var yOffset = nNodeTextHeight + nNodeTextPadding + 2;
    var x = node.left + xOffset + clientRect.left;
    var y = node.top + yOffset + clientRect.top + document.body.scrollTop;
    //var y = node.top + node.bottom + clientRect.top - 5;
    nodeDetails.style.left = x + "px";
    nodeDetails.style.top = y + "px";

    /*
    document.body.scrollTop = canvasContainer.offsetTop + 1;
    <tr><td class="node-column">Name</td><td class="node-name" id="nd-name">SampleNodeName</td></tr>
    <tr><td class="node-column">Attr</td><td class="attributes" id="nd-attr"><b>AttrOne:</b> TypeInfo<br/><b>AttributeTwo:</b> TypeInfo</td></tr>
    <tr><td class="node-column">Type</td><td class="type-description" id="nd-type">Type Description</td></tr>
    <tr><td class="node-column">Descr</td><td class="annotation" id="nd-anno">First line of annotation text<br/>second line of annotation text<br/>third line</td></tr>
    <tr><td class="node-column">Enum</td><td class="enumeration" id="nd-enum">FIRST<br/>SECOND<br/>THIRD<br/>FOURTH</td></tr>
    <tr><td class="node-column">XPath</td><td class="xpath" id="nd-xpath">/FundsXML4/Funds/Fund/FundDynamicData/TotalAssetValues/TotalAssetValue</td></tr>
    */
    NodeDetailsName.innerHTML = node.name;

    if (Nodes[nodeIndex].attributes) {
        txt = "<b>" + node.attributes[0].name + ": </b>" + node.attributes[0].type + " [" + node.attributes[0].use + "]";
        for (i = 1; i < node.attributes.length; i++) {
            txt += "<br/><b>" + node.attributes[i].name + ": </b> " + node.attributes[i].type;
            if (node.attributes[i].use)
                txt += " <b>[" + node.attributes[i].use + "]</b>";
        }
    } else
        txt = "";
    NodeDetailsAttr.innerHTML = txt;

    NodeDetailsType.innerHTML = node.typeDescription;

    if (node.pattern)
        txt = node.pattern;
    else
        txt = "";
    NodeDetailsPattern.innerHTML = txt;

    if (node.annotation) {
        txt = node.annotationLines[0];
        for (i = 1; i < node.annotationLines.length; i++) {
            txt += "<br/>" + node.annotationLines[i];
        }
    } else
        txt = "";
    NodeDetailsAnno.innerHTML = txt;

    if (node.enumeration && node.enumeration[0]) {
        // calculate average length of enumerations
        var len = node.enumeration[0].length;
        for (i = 1; i < node.enumeration.length; i++)
            len += node.enumeration[i].length;
        len = len / node.enumeration.length;

        if (len > 5) {
            // fill enumeration block
            txt = node.enumeration[0];
            for (i = 1; i < node.enumeration.length; i++) {
                txt += "<br/>" + node.enumeration[i];
            }
        } else {
            txt = node.enumeration[0];
            len = txt.length;
            for (i = 1; i < node.enumeration.length; i++) {
                if (len + node.enumeration[i].length > 40) {
                    txt += "<br/>" + node.enumeration[i];
                    len = node.enumeration[i].length;
                } else {
                    txt += ", " + node.enumeration[i];
                    len += 2 + node.enumeration[i].length;
                }
            }
        }
    } else
        txt = "";
    NodeDetailsEnum.innerHTML = txt;

    //txt = "/FundsXML4/.../" + node.name;
    txt = XPath(nodeIndex);
    NodeDetailsXPath.innerHTML = txt;

    nodeDetails.style.display = "block";

    var xx = x + nodeDetails.offsetWidth - clientRect.left;
    var yy = y + nodeDetails.offsetHeight - clientRect.top;
    MakeVisibleAndUpdate(xx, yy);

    // make sure node details window is displayed completely
    clientRect = canvas.getBoundingClientRect();
    x = node.left + xOffset + clientRect.left;
    y = node.top + yOffset + clientRect.top + document.body.scrollTop;
    nodeDetails.style.left = x + "px";
    nodeDetails.style.top = y + "px";

    //nodeDetails.style.display = "block";
    setTimeout(function () {
        nodeDetails.style.display = "block";
    }, 50);
}


function NodeClicked(nodeIndex, showNodeDetails) {
    nLastClickedNodeIndex = nodeIndex;
    nLastExpandedNodeIndex = null;

    if (nodeIndex) {
        var firstChildIndex = Nodes[nodeIndex].firstChildIndex;
        if (firstChildIndex) {
            if (Nodes[nodeIndex].expanded) {
                Nodes[nodeIndex].expanded = false;
                nLastCollapsedNodeIndex = nodeIndex;
            } else {
                Nodes[nodeIndex].expanded = true;
                nLastExpandedNodeIndex = nodeIndex;
                var nodeType = Nodes[firstChildIndex].type;
                if ((nodeType == NodeTypeChoice || nodeType == NodeTypeSequence) && Nodes[firstChildIndex].firstChildIndex) {
                    Nodes[firstChildIndex].expanded = true;
                    nLastExpandedNodeIndex = firstChildIndex;
                }
                ExpandChoiceNodes(nLastExpandedNodeIndex);
            }
            SetVerNodePositions();
            //DrawTree();
        } else {
            if (nodeDetails.style.display == "none" && showNodeDetails)
                ShowNodeDetails(nodeIndex);
            else
                nodeDetails.style.display = "none";
        }
    } else
        nodeDetails.style.display = "none";

    DrawTree();
}


function ClickDetected(event) {
    var nodeIndex = getObjectAtCursor(canvas, event);
    NodeClicked(nodeIndex, true);
}

/*
function RightClickDetected(event)
{
var canvas = document.getElementById("tree");
//getCursorPosition(canvas, event);
var nodeIndex = getObjectAtCursor(canvas, event);
nLastClickedNodeIndex = nodeIndex;
if (nodeIndex) {
nodeDetails.style.left = event.clientX + "px"; // "600px";
nodeDetails.style.top = event.clientY + "px";
nodeDetails.style.display = "block";
}
else
nodeDetails.style.display = "none";
}
function openModal() {
document.getElementById('node-details').style.display = "block";
}
function closeModal() {
document.getElementById('node-details').style.display = "none";
}
*/

function ContainerOnScroll() {
    nodeDetails.style.display = "none";
}

/*
function myFunction(value1,value2,value3)
{
var ResultObject = {};
ResultObject["result1"] = value1 + value2;
ResultObject["result2"] = value1 * value3;
return ResultObject;
}
var ResultObject = myFunction(1,2,3);
*/

//DrawTree();

var elem = document.getElementById('tree');
elem.addEventListener('click', ClickDetected);
//elem.addEventListener('contextmenu', RightClickDetected);
//elem.addEventListener('dblclick', RightClickDetected);

elem = document.getElementById('canvas-container');
elem.addEventListener('scroll', ContainerOnScroll);

//oncontextmenu = "javascript:alert('success!');return false;"


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Search functions


function SearchSubTree(nodeIndex) {
    var matching = false;

    if (IsRealNode(Nodes[nodeIndex].type)) {
        var nodeName = Nodes[nodeIndex].name;
        if (nodeName && nodeName.toLowerCase().search(lastSearchText) >= 0)
            matching = true;
    }

    var annotation = Nodes[nodeIndex].annotation;
    if (!matching && annotation)
        if (annotation.toLowerCase().search(lastSearchText) >= 0)
            matching = true;

    if (matching) {
        if (SearchResults.length >= nMaxSearchResults)
            bTooManySearchResults = true;
        else
            SearchResults.push(nodeIndex);
    }

    var nextNodeIndex = Nodes[nodeIndex].firstChildIndex;

    while (nextNodeIndex && !bTooManySearchResults) {
        SearchSubTree(nextNodeIndex);
        nextNodeIndex = Nodes[nextNodeIndex].nextIndex;
    }
}


function SearchButtonPressed() {
    var searchResultElement;
    var nodeIndex, i;
    var bDisplayResultTable = false;

    lastSearchText = searchText.value.trim().toLowerCase();

    SearchResults = new Array();
    bTooManySearchResults = false;
    searchResultDiv.scrollTop = 0;

    if (lastSearchText.length > 2) {
        SearchSubTree(rootNodeIndex);
        bDisplayResultTable = true;
    }

    for (i = 0; i < SearchResults.length; i++) {
        searchResultElement = document.getElementById('SearchResult' + (i + 1));
        nodeIndex = SearchResults[i];
        searchResultElement.innerHTML = '' + XPath(nodeIndex).replace(/\//g, ' / ');  // + ' [' + nodeIndex + ']';
    }

    for (i = SearchResults.length; i < nMaxSearchResults; i++) {
        searchResultElement = document.getElementById('SearchResult' + (i + 1));
        searchResultElement.innerHTML = '';
    }

    if (bTooManySearchResults)
        tooManyResults.innerHTML = 'Too many results found';
    else
        tooManyResults.innerHTML = '';

    if (bDisplayResultTable) {
        if (SearchResults.length == 0)
            firstSearchResult.innerHTML = 'No results found for this search text ...';
        searchResultDiv.style.display = "block";
        searchResetButton.style.display = "inline-block";
    } else {
        searchResultDiv.style.display = "none";
        searchResetButton.style.display = "none";
    }

    DrawTree();
}


// Detect enter key pressed within search text input field
searchText.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode == 13)
        SearchButtonPressed();
});


function SetAllNodesCollapsed(nodeIndex) {
    Nodes[nodeIndex].expanded = false;

    var nextNodeIndex = Nodes[nodeIndex].firstChildIndex;

    while (nextNodeIndex) {
        SetAllNodesCollapsed(nextNodeIndex);
        nextNodeIndex = Nodes[nextNodeIndex].nextIndex;
    }
}


function SetPathExpanded(nodeIndex) {
    if (Nodes[nodeIndex].firstChildIndex)
        Nodes[nodeIndex].expanded = true;
    var parentIndex = Nodes[nodeIndex].parentIndex;
    if (parentIndex)
        SetPathExpanded(parentIndex);
}


function SearchResultClicked(index) {
    if (index >= 0 && index < SearchResults.length) {
        var nodeIndex = SearchResults[index];
        SetAllNodesCollapsed(rootNodeIndex);
        SetPathExpanded(nodeIndex);

        SetVerNodePositions();
        MoveNodeToCenter(nodeIndex);

        if (Nodes[nodeIndex].firstChildIndex)
            Nodes[nodeIndex].expanded = false;

        SetVerNodePositions();
        NodeClicked(nodeIndex, false);
    }
}


function SearchResetPressed() {
    searchText.value = '';
    SearchResults = new Array();
    searchResultDiv.style.display = "none";
    searchResetButton.style.display = "none";
    DrawTree();
}