const PDFDocument = require('pdfkit');
const fs = require('fs');

function findCategory(categories,size, id){
    for(var j = 0; j < size; j++){
        if(categories[j].categoryid == id)
            return categories[j].name;
    }
}

function dateFromat(date) {
    let temp = date.split('-');
    return [temp[2], temp[1], temp[0]].join('.');
}


module.exports = function (data, res, userid) {
    
    const doc = new PDFDocument;
    doc.pipe(fs.createWriteStream( userid + '_output.pdf'));
    doc.fontSize(17)

    if (!data[0].name) data[0].name = "";
    if (!data[0].lastname) data[0].lastname = "";
    
    doc.text('Dokument preuzeo: ');

    if (data[0].name !== "" && data[0].lastname !== "") {   
        doc.text(data[0].name + ' ' + data[0].lastname, { lineGap: 10 }).fontSize(20);
    } else {
        doc.text('Nepoznato', { lineGap: 10 }).fontSize(20);
    }

    doc.text('Prihodi : ', { lineGap: 8 }).fontSize(14);

   // console.log(data[4]);

    for (var i = 0; i < data[4]; i++){
        doc.text('Ime prihoda : ' + data[3][i].label);
        doc.text('Vrijednost : ' + data[3][i].price + 'kn');
        doc.text('Broj ponavljanja : ' + data[3][i].evaluate);
        doc.text('Pocetni datum : ' + dateFromat(data[3][i].fromDate));
        doc.text('Krajnji datum : ' + dateFromat(data[3][i].toDate));
        if (!data[3][i].comment) data[3][i].comment = "";
        if (i % 4 === 0 && i != 0 && i !== (data[4] - 1)){
            doc.text('Komentar : ' + data[3][i].comment,{lineGap:10}).addPage();
        }else{
            doc.text('Komentar : ' + data[3][i].comment,{lineGap:10});
        }
    }
    doc.addPage().fontSize(20);
    doc.text('Troškovi : ',{lineGap:8}).fontSize(14);
    for(var i = 0; i < data[6]; i++){
        doc.text('Ime troška : ' + data[5][i].label);
        doc.text('Ime kategorije : ' + findCategory(data[1],data[2], data[5][i].categoryid));
        doc.text('Vrijednost : ' + data[5][i].price + 'kn');
        doc.text('Broj ponavljanja : ' + data[5][i].evaluate);
        doc.text('Pocetni datum : ' + dateFromat(data[5][i].fromDate));
        doc.text('Krajnji datum : ' + dateFromat(data[5][i].toDate));
        if (!data[5][i].comment) data[5][i].comment = "";
        if(i % 4 === 0 && i != 0 && i !== (data[6] - 1)){
            doc.text('Komentar : ' + data[5][i].comment,{lineGap:10}).addPage();
        }else{
            doc.text('Komentar : ' + data[5][i].comment,{lineGap:10});
        }
    }

    doc.end();
    fs.closeSync(2);

    setTimeout(() => {

        res.download(userid + '_output.pdf', (error) => {
            fs.unlink(userid + '_output.pdf', function (error) {
                if (error) {
                    throw error;
                }
                //console.log('Deleted pdf file!');
            });
        });      
    }, 200);
  
    //console.log(data);
    return;
}