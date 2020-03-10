<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:fo="http://www.w3.org/1999/XSL/Format"
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns:xs="http://www.w3.org/2001/XMLSchema"
      xmlns:xlink="http://www.w3.org/1999/xlink"
>
  <xsl:output method="html" indent="yes" encoding="UTF-8"/>


  <xsl:variable name="css" select="unparsed-text('../css/xsdview.css')" />
  <xsl:variable name="js" select="unparsed-text('../js/xsdview.js')" />


  <xsl:template match="/" >



    <html>



      <head>
        <TITLE>XML Schema Viewer</TITLE>
        <META content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <META name="author" content="Peter Raffelsberger"/>
        <META name="description" content=""/>
        <META name="keywords" content=""/>
      </head>

      <style type="text/css">
          <xsl:value-of select="$css" disable-output-escaping="yes"/>
      </style>

      <script type="text/javascript">
        <xsl:value-of select="$js" disable-output-escaping="yes" />
      </script>


      <body>



<!--      <div>-->
        <xsl:text disable-output-escaping="yes">
         <![CDATA[




        <p class="XSD" id="LoadSchemaParagraph">
          <b>XML Schema Definition:</b><br/>
          <textarea id="schema-text" name="xml-schema" rows="50" cols="200"></textarea>
          <br/>
          <a class="button" href1="" id="LoadSchemaButton" onclick="LoadSchema();">Load Schema</a>
          <a class="button" href1="" id="SampleSchema" onclick="SampleSchema();">Sample Schema</a>
          <code id="Status" style="display: none;"></code>
        </p>

        <fieldset id="SchemaOptions" style="display: none;">
          <label><input type="checkbox" id="cbAnnotations" onclick="AnnotationChanged();" value="1" checked> Annotations</label>
          <label><input type="checkbox" id="cbTypeInfo" onclick="TypeInfoChanged();" value="1" checked> Type Info</label>
          <label class="search">
            <input class="search-text" id="SearchText" value=""><input class="search-button" id="SearchButton" onclick="SearchButtonPressed();" value="SEARCH" size="5" readonly><input class="search-button" id="SearchReset" onclick="SearchResetPressed();" value="RESET" size="4" readonly>
          </label>
        </fieldset>

        <div class="search-result" id="SearchResultDiv" style="height: 152px; overflow: scroll;">
          <table class="search-result">
            <tr class="search-result" onclick="SearchResultClicked(0);"><td class="xpath" id="SearchResult1">XPath-1</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(1);"><td class="xpath" id="SearchResult2">XPath-2</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(2);"><td class="xpath" id="SearchResult3">XPath-3</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(3);"><td class="xpath" id="SearchResult4">XPath-4</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(4);"><td class="xpath" id="SearchResult5">XPath-5</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(5);"><td class="xpath" id="SearchResult6">XPath-6</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(6);"><td class="xpath" id="SearchResult7">XPath-7</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(7);"><td class="xpath" id="SearchResult8">XPath-8</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(8);"><td class="xpath" id="SearchResult9">XPath-9</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(9);"><td class="xpath" id="SearchResult10">XPath-10</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(10);"><td class="xpath" id="SearchResult11">XPath-11</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(11);"><td class="xpath" id="SearchResult12">XPath-12</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(12);"><td class="xpath" id="SearchResult13">XPath-13</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(13);"><td class="xpath" id="SearchResult14">XPath-14</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(14);"><td class="xpath" id="SearchResult15">XPath-15</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(15);"><td class="xpath" id="SearchResult16">XPath-16</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(16);"><td class="xpath" id="SearchResult17">XPath-17</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(17);"><td class="xpath" id="SearchResult18">XPath-18</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(18);"><td class="xpath" id="SearchResult19">XPath-19</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(19);"><td class="xpath" id="SearchResult20">XPath-20</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(20);"><td class="xpath" id="SearchResult21">XPath-21</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(21);"><td class="xpath" id="SearchResult22">XPath-22</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(22);"><td class="xpath" id="SearchResult23">XPath-23</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(23);"><td class="xpath" id="SearchResult24">XPath-24</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(24);"><td class="xpath" id="SearchResult25">XPath-25</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(25);"><td class="xpath" id="SearchResult26">XPath-26</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(26);"><td class="xpath" id="SearchResult27">XPath-27</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(27);"><td class="xpath" id="SearchResult28">XPath-28</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(28);"><td class="xpath" id="SearchResult29">XPath-29</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(29);"><td class="xpath" id="SearchResult30">XPath-30</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(30);"><td class="xpath" id="SearchResult31">XPath-31</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(31);"><td class="xpath" id="SearchResult32">XPath-32</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(32);"><td class="xpath" id="SearchResult33">XPath-33</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(33);"><td class="xpath" id="SearchResult34">XPath-34</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(34);"><td class="xpath" id="SearchResult35">XPath-35</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(35);"><td class="xpath" id="SearchResult36">XPath-36</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(36);"><td class="xpath" id="SearchResult37">XPath-37</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(37);"><td class="xpath" id="SearchResult38">XPath-38</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(38);"><td class="xpath" id="SearchResult39">XPath-39</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(39);"><td class="xpath" id="SearchResult40">XPath-40</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(40);"><td class="xpath" id="SearchResult41">XPath-41</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(41);"><td class="xpath" id="SearchResult42">XPath-42</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(42);"><td class="xpath" id="SearchResult43">XPath-43</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(43);"><td class="xpath" id="SearchResult44">XPath-44</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(44);"><td class="xpath" id="SearchResult45">XPath-45</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(45);"><td class="xpath" id="SearchResult46">XPath-46</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(46);"><td class="xpath" id="SearchResult47">XPath-47</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(47);"><td class="xpath" id="SearchResult48">XPath-48</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(48);"><td class="xpath" id="SearchResult49">XPath-49</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(49);"><td class="xpath" id="SearchResult50">XPath-50</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(50);"><td class="xpath" id="SearchResult51">XPath-51</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(51);"><td class="xpath" id="SearchResult52">XPath-52</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(52);"><td class="xpath" id="SearchResult53">XPath-53</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(53);"><td class="xpath" id="SearchResult54">XPath-54</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(54);"><td class="xpath" id="SearchResult55">XPath-55</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(55);"><td class="xpath" id="SearchResult56">XPath-56</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(56);"><td class="xpath" id="SearchResult57">XPath-57</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(57);"><td class="xpath" id="SearchResult58">XPath-58</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(58);"><td class="xpath" id="SearchResult59">XPath-59</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(59);"><td class="xpath" id="SearchResult60">XPath-60</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(60);"><td class="xpath" id="SearchResult61">XPath-61</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(61);"><td class="xpath" id="SearchResult62">XPath-62</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(62);"><td class="xpath" id="SearchResult63">XPath-63</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(63);"><td class="xpath" id="SearchResult64">XPath-64</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(64);"><td class="xpath" id="SearchResult65">XPath-65</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(65);"><td class="xpath" id="SearchResult66">XPath-66</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(66);"><td class="xpath" id="SearchResult67">XPath-67</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(67);"><td class="xpath" id="SearchResult68">XPath-68</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(68);"><td class="xpath" id="SearchResult69">XPath-69</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(69);"><td class="xpath" id="SearchResult70">XPath-70</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(70);"><td class="xpath" id="SearchResult71">XPath-71</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(71);"><td class="xpath" id="SearchResult72">XPath-72</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(72);"><td class="xpath" id="SearchResult73">XPath-73</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(73);"><td class="xpath" id="SearchResult74">XPath-74</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(74);"><td class="xpath" id="SearchResult75">XPath-75</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(75);"><td class="xpath" id="SearchResult76">XPath-76</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(76);"><td class="xpath" id="SearchResult77">XPath-77</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(77);"><td class="xpath" id="SearchResult78">XPath-78</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(78);"><td class="xpath" id="SearchResult79">XPath-79</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(79);"><td class="xpath" id="SearchResult80">XPath-80</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(80);"><td class="xpath" id="SearchResult81">XPath-81</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(81);"><td class="xpath" id="SearchResult82">XPath-82</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(82);"><td class="xpath" id="SearchResult83">XPath-83</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(83);"><td class="xpath" id="SearchResult84">XPath-84</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(84);"><td class="xpath" id="SearchResult85">XPath-85</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(85);"><td class="xpath" id="SearchResult86">XPath-86</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(86);"><td class="xpath" id="SearchResult87">XPath-87</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(87);"><td class="xpath" id="SearchResult88">XPath-88</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(88);"><td class="xpath" id="SearchResult89">XPath-89</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(89);"><td class="xpath" id="SearchResult90">XPath-90</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(90);"><td class="xpath" id="SearchResult91">XPath-91</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(91);"><td class="xpath" id="SearchResult92">XPath-92</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(92);"><td class="xpath" id="SearchResult93">XPath-93</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(93);"><td class="xpath" id="SearchResult94">XPath-94</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(94);"><td class="xpath" id="SearchResult95">XPath-95</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(95);"><td class="xpath" id="SearchResult96">XPath-96</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(96);"><td class="xpath" id="SearchResult97">XPath-97</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(97);"><td class="xpath" id="SearchResult98">XPath-98</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(98);"><td class="xpath" id="SearchResult99">XPath-99</td></tr>
            <tr class="search-result" onclick="SearchResultClicked(99);"><td class="xpath" id="SearchResult100">XPath-100</td></tr>
            <tr class="search-result"><td class="xpath" id="TooManyResults">Too many results found</td></tr>
          </table>
        </div>

        <div id="canvas-container" style="height: 750px; overflow: scroll; display: none;">
          <canvas id="tree" width="5000" height="5000" style="border:1px solid #000000; background-color: #EDEDED;">Your browser does not support canves :-(</canvas>
          <!--div id="node-details" class="nodedetails">Line One is longer then the rest<br />Line Two is shorter<br />Line Three <br />Line Four is medium length</div-->
          <div id="node-details" class="node-details">
            <table class="node-details">
              <tr><td class="nd-column">Name</td><td class="nd-name" id="nd-name">SampleNodeName</td></tr>
              <tr><td class="nd-column">Attr</td><td class="nd-attr" id="nd-attr"><b>AttrOne:</b> TypeInfo<br/><b>AttributeTwo:</b> TypeInfo</td></tr>
              <tr><td class="nd-column">Type</td><td class="nd-type" id="nd-type">Type Description</td></tr>
              <tr><td class="nd-column">Pattern</td><td class="nd-pattern" id="nd-pattern">Pattern</td></tr>
              <tr><td class="nd-column">Descr</td><td class="nd-anno" id="nd-anno">First line of annotation text<br/>second line of annotation text<br/>third line</td></tr>
              <tr><td class="nd-column">Enum</td><td class="nd-enum" id="nd-enum">FIRST<br/>SECOND<br/>THIRD<br/>FOURTH</td></tr>
              <tr><td class="nd-column">XPath</td><td class="nd-xpath" id="nd-xpath">/FundsXML4/Funds/Fund/FundDynamicData/TotalAssetValues/TotalAssetValue</td></tr>
            </table>
          </div>
        </div>

        <p id="trace" style="display: none; margin: 0px;"></p>

        <p class="bottom-line" id="BottomLineParagraph">Written by Peter Raffelsberger (contact: info@xml-tools.net)
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a class="bottom-line" href="https://github.com/peterraf/online-xsd-viewer" target="_blank">Published on GitHub unter MIT-Licence</a>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Press F5 to view another schema
        </p>
        ]]>
            </xsl:text>
<!--      </div>-->

      </body>
    </html>




  </xsl:template>


</xsl:stylesheet>
