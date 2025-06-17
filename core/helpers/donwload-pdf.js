import { this_year } from "./const.js";
import { _ } from "./helpers.js";

export default class DownloadPDF {
    constructor() {
        this.year = this_year;
    }

    async margeFiles(options) {
        const { lists, type, display, targetClass, cert, title } = options;
        const pdfDoc = await this.createPdfDoc();
        const numDocs = lists.length;

        if (type === "byClass") {
            await this.byClass({
                lists,
                numDocs,
                display,
                pdfDoc,
                targetClass,
                title,
                cert,
            });
        }
    }
    async oneFace(user_matt, annee, title) {
        const url =
            annee == this_year
                ? `scolarite/dossier_eleves/etats_imp/attestation`
                : `scolarite/dossier_eleves/etats_imp/certificat`;
        var PdfBytes = await this.fetchPdfBytes(
            `https://amatti.education.dz/${url}/${user_matt}/${annee}`
        );

        // Load the original PDF document
        const donorPdfDoc = await this.loadPdfDoc(PdfBytes);

        // Create a new PDF document to copy the page into
        const pdfDoc = await this.createPdfDoc();

        // Get the first page from the original PDF
        const inputPage = donorPdfDoc.getPages()[0];

        // Embed the first page from the original PDF into the new document
        const [pageOne] = await pdfDoc.embedPdf(PdfBytes, [0]);

        // Add a new page to the new PDF document
        const page = pdfDoc.addPage([
            inputPage.getWidth(),
            inputPage.getHeight(),
        ]);

        // Draw the first page as-is onto the new page
        page.drawPage(pageOne);
        this.handlePdfOutput({ display: "show", pdfDoc, title });
        //const pdfBytes = await pdfDoc.save();
        //const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
        //const pdfUrl = URL.createObjectURL(pdfBlob);
        //window.open(pdfUrl); // show new tab
    }
    async TwoFace(user_matt, annee, title) {
        const url =
            annee == this_year
                ? `scolarite/dossier_eleves/etats_imp/attestation`
                : `scolarite/dossier_eleves/etats_imp/certificat`;
        var PdfBytes = "";
        var PdfBytesTwo = "";
        if (Array.isArray(user_matt)) {
            PdfBytes = await this.fetchPdfBytes(
                `https://amatti.education.dz/${url}/${user_matt[0]}/${annee}`
            );
            PdfBytesTwo = await this.fetchPdfBytes(
                `https://amatti.education.dz/${url}/${user_matt[1]}/${annee}`
            );
        } else {
            var PdfBytes = await this.fetchPdfBytes(
                `https://amatti.education.dz/${url}/${user_matt}/${annee}`
            );
            PdfBytesTwo = PdfBytes;
        }

        //const PdfBytes = await this.fetchPdfBytes(
        //  `https://amatti.education.dz/${url}/${user_matt}/${annee}`
        //);

        const pdfDoc = await this.createPdfDoc();
        const [width, height] = [842, 595];
        const donorPdfDoc = await this.loadPdfDoc(PdfBytes);
        const inputPage = donorPdfDoc.getPages()[0];
        const scale = Math.min(
            width / inputPage.getWidth(),
            height / inputPage.getHeight()
        );
        const [pageOne] = await pdfDoc.embedPdf(PdfBytes);
        const [pageTwo] = await pdfDoc.embedPdf(PdfBytesTwo);
        const pageOneDims = pageOne.scale(scale);
        const pageTwoDims = pageTwo.scale(scale);
        const page = pdfDoc.addPage([width, height]);
        page.drawPage(pageOne, {
            ...pageOneDims,
            x: 0,
            y: 0,
            width: inputPage.getWidth() * scale,
            height: inputPage.getHeight() * scale,
        });
        page.drawPage(pageTwo, {
            ...pageTwoDims,
            x: width / 2,
            y: 0,
            width: inputPage.getWidth() * scale,
            height: inputPage.getHeight() * scale,
        });
        this.handlePdfOutput({ display: "show", pdfDoc, title });
        //const pdfBytes = await pdfDoc.save();
        //const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
        //const pdfUrl = URL.createObjectURL(pdfBlob);
        //window.open(pdfUrl); // show new tab
    }

    async byClass(options) {
        const { lists, numDocs, display, pdfDoc, targetClass, title, cert } =
            options;

        for (let index = 0; index < lists.length; index++) {
            const id = lists[index];
            const url = this.student(id, cert);
            this.getPdfData(url, pdfDoc);
            await _.sleep(900);
            _.qSel(`.${targetClass} .body`).innerHTML = `تم تجهيز ${
                index + 1
            } من أصل ${numDocs}`;
        }

        this.handlePdfOutput({ display, pdfDoc, title });
        _.qSel(`.${targetClass} .title`).innerHTML = "";
        _.qSel(`.${targetClass} .body`).innerHTML = "";
        if (_.qSel(`.${targetClass}  .time`))
            _.qSel(`.${targetClass}  .time`).innerHTML = "";
    }

    handlePdfOutput(options) {
        const { display, pdfDoc, title } = options;

        if (display === "show") {
            this.open(pdfDoc);
        } else {
            this.download({ pdfDoc, class_name: title });
        }
    }

    async open(pdfDoc) {
        const pdfData = await pdfDoc.save();
        const pdfBlob = new Blob([pdfData], { type: "application/pdf" });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl);
    }

    async download(options) {
        const { pdfDoc, class_name } = options;
        const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
        const pdfData = pdfDataUri.substring(pdfDataUri.indexOf(",") + 1);
        const linkSource = `data:application/pdf;base64,${pdfData}`;
        const downloadLink = document.createElement("a");
        const fileName = `${class_name}.pdf`;
        downloadLink.href = linkSource;
        downloadLink.target = "_blank";
        downloadLink.download = fileName;
        downloadLink.click();
    }

    async getPdfData(url, pdfDoc) {
        const donorPdfBytes = await this.fetchPdfBytes(
            `https://amatti.education.dz/${url}`
        );
        const donorPdfDoc = await this.loadPdfDoc(donorPdfBytes);
        await this.copyPdfPages(pdfDoc, donorPdfDoc);
    }

    student(id, cert) {
        const type = cert === "chahada" ? "attestation" : "fiche_eleve";
        return `scolarite/dossier_eleves/etats_imp/${type}/${id}/${this.year}`;
    }

    worker(id) {
        return `pers/personnel/attestation/${id}`;
    }

    async createPdfDoc() {
        return await PDFLib.PDFDocument.create();
    }

    async fetchPdfBytes(url) {
        return await fetch(url).then((res) => res.arrayBuffer());
    }

    async loadPdfDoc(bytes) {
        return await PDFLib.PDFDocument.load(bytes);
    }

    async copyPdfPages(pdfDoc, donorPdfDoc) {
        const [donorPage] = await pdfDoc.copyPages(donorPdfDoc, [0]);
        pdfDoc.addPage(donorPage);
    }
}
