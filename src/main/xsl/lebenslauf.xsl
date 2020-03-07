<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
      xmlns:fo="http://www.w3.org/1999/XSL/Format"
      xmlns:svg="http://www.w3.org/2000/svg" 
      xmlns:xlink="http://www.w3.org/1999/xlink"
>
  <xsl:output method="xml" indent="yes"/>
  

  <xsl:variable name="grey1">#c0c0c0</xsl:variable>
  <xsl:variable name="grey2">#a0a0a0</xsl:variable>
  <xsl:variable name="border-color">#a0a0a0</xsl:variable>

  
  
  <xsl:template match="/">
    <fo:root>

      <fo:layout-master-set>
        <fo:simple-page-master 
          master-name="A4-portrait"
          page-height="29.7cm" page-width="21.0cm" margin="1cm">
          <fo:region-body 
            region-name="body"
            margin-top="1cm"
            margin-bottom="1cm"
          />

          <fo:region-before 
            extent="1.0cm"
            region-name="header"            
          />
          <fo:region-after 
            extent="1.0cm"
            region-name="footer"
          />
                    
          
        </fo:simple-page-master>        
      </fo:layout-master-set>
      
      
      <fo:page-sequence master-reference="A4-portrait">
        
<!--        <fo:static-content flow-name="header">
          <fo:block>
            Header
          </fo:block>
        </fo:static-content>-->
        
        <fo:static-content flow-name="footer">
<!--          <fo:block background-color="#b70e0c" color="#ffffff" padding="1mm" font-size="3mm" >
            <xsl:value-of select="/*/kopf/foot" />
          </fo:block>-->
          <fo:block>
          </fo:block>
        </fo:static-content>
        
        
        <fo:flow flow-name="body">
          <fo:block>
            <xsl:apply-templates select="/*"/>
          </fo:block>
        </fo:flow>
                        
      </fo:page-sequence>
            
    </fo:root>
  </xsl:template>
  
  
  <xsl:template match="person">

    <fo:block-container>
    <fo:block text-align="left" line-height="40pt" margin-left="0cm" margin-top="2cm">        
      <fo:external-graphic height="auto" width="auto" content-height="auto"
        content-width="4.5cm" src="file:./{picture}">
      </fo:external-graphic> 
    </fo:block>  
              
      <!--<fo:inline-container padding-left="0.8cm" font-size="22pt" margin-top="0" margin-left="0" >-->
        <fo:block-container position="absolute" top="7.6cm" left="6cm" text-align="right" font-size="22pt">
          <fo:block color="{$grey1}">        
              <xsl:apply-templates select="vorname" />                      
          </fo:block>
          <fo:block color="{$grey2}" >
              <xsl:apply-templates select="nachname" />        
          </fo:block> 
        </fo:block-container>  
      <!--</fo:inline-container>-->
        <fo:block border-bottom-color="{$border-color}" border-bottom-style="solid" border-bottom-width="0.4mm" font-size="8pt" margin-top="0">
<!--          <xsl:apply-templates select="phone"></xsl:apply-templates>
          <xsl:apply-templates select="email"></xsl:apply-templates>-->
        </fo:block>   
        
        <fo:block>
          
        </fo:block>
          
        <fo:block text-align="right" color="{$grey2}" font-size="22pt" margin-top="0.2cm" margin-bottom="2cm">LEBENSLAUF</fo:block>
    </fo:block-container>
  
  </xsl:template>  
  
  
  <xsl:template match="chapter">
    <fo:block margin-left="4cm" font-size="20pt">
      <xsl:value-of select="@title" />
    </fo:block>
    <fo:block border-bottom-color="{$border-color}" border-bottom-style="solid" border-bottom-width="0.4mm" />
    <xsl:apply-templates />
  </xsl:template>
  
  <xsl:template match="entries">
    <fo:block margin-left="4cm" font-size="18pt">
      <xsl:value-of select="@title" />
    </fo:block>
    <xsl:apply-templates>
      
    </xsl:apply-templates>
  </xsl:template>
  
  <xsl:template match="entry">   
    <fo:block>
      <fo:table>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell text-align="right" width="4cm">
              <fo:block margin-right="0.5cm">
                <xsl:apply-templates select="start" /><xsl:apply-templates select="end" /> 
              </fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>
                <xsl:apply-templates select="title" />, 
                <xsl:apply-templates select="subtitle" />, 
                <xsl:apply-templates select="text" />
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:block>    
  </xsl:template>
  
<!--   rechte tabellenspalte bei zeitraum 
  <xsl:template match="entry" >
      <xsl:apply-templates select="title" />, 
      <xsl:apply-templates select="subtitle" />, 
      <xsl:apply-templates select="text" />
  </xsl:template>
  
   linke tabellenspalte bei zeitraum 
  <xsl:template match="entry"  >
      <xsl:apply-templates select="start" /><xsl:apply-templates select="end" /> 
  </xsl:template>-->
  
  <xsl:template match="entry/title" >
    <fo:inline font-weight="bold">
      <xsl:apply-templates />
    </fo:inline>
  </xsl:template>
  
    <xsl:template match="entry/subtitle" >
    <fo:inline font-style="italic">
      <xsl:apply-templates />
    </fo:inline>
  </xsl:template>
  
  <xsl:template match="entry/end">
    <xsl:call-template name="zeitraum" />
  </xsl:template>
  
  <xsl:template match="entry/start">
    <xsl:call-template name="zeitraum" />-
  </xsl:template>
  
  <xsl:template name="zeitraum">
    <fo:inline>
      <xsl:apply-templates select="month" />/<xsl:apply-templates select="year" />
    </fo:inline>
  </xsl:template>
  
  
    <xsl:template match="qualifikation">   
    <fo:block>
      <fo:table>
        <fo:table-body>
          <fo:table-row>
            <fo:table-cell text-align="right" width="4cm">
              <fo:block margin-right="0.5cm">
                <xsl:apply-templates select="name" />
              </fo:block>
            </fo:table-cell>
            <fo:table-cell>
              <fo:block>
                <xsl:apply-templates select="level" />           
                <xsl:apply-templates select="description" />
              </fo:block>
            </fo:table-cell>
          </fo:table-row>
        </fo:table-body>
      </fo:table>
    </fo:block>    
  </xsl:template>
  
  
  
  
  
</xsl:stylesheet>
