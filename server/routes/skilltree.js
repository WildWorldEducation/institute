const express = require('express');

// Router.
const router = express.Router();

var fs = require('fs'),
  PDFDocument = require('pdfkit'),
  SVGtoPDF = require('svg-to-pdfkit');


// Print to PDF.
/*** ExpressJs code for webserver ***/
router.post('/pdf', (req, res, next) => {

  // Add the SVG-to_PDFKit plugin to the PDFKit doc.
  PDFDocument.prototype.addSVG = function (svg, x, y, options) {
    return SVGtoPDF(this, svg, x, y, options), this;
  };
  // Create a new PDF doc. 
  // This is the size of the full linear chart, with no filters.
  const doc = new PDFDocument({ size: [5000, 37500], });
  // Add the SVG to the doc.  
  doc.addSVG(req.body.svg, 0, 0);


  doc.pipe(fs.createWriteStream('c:/work/file.pdf')); // write to PDF
  doc.pipe(res);                                       // HTTP response

  // add stuff to PDF here using methods described below...

  // finalize the PDF and end the stream
  doc.end();
})


module.exports = router
