import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';

// Export to PDF
export const exportToPDF = async (members, fileName = 'gia-pha-ho-dang') => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(34, 139, 34); // Green
    doc.text('GIA PHẢ HỌ ĐẶNG ĐÀ NẴNG', 105, 20, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('"Uống nước nhớ nguồn - Ăn quả nhớ kẻ trồng cây"', 105, 30, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 105, 40, { align: 'center' });

    // Table data
    const tableData = members.map((m, i) => [
        i + 1,
        m.fullName,
        m.gender === 'male' ? 'Nam' : 'Nữ',
        `Đời ${m.generation}`,
        m.birthDate ? new Date(m.birthDate).getFullYear() : '-',
        m.deathDate ? new Date(m.deathDate).getFullYear() : (m.isDeceased ? '-' : 'Còn sống'),
        m.biography?.substring(0, 50) || ''
    ]);

    // Add table
    autoTable(doc, {
        startY: 50,
        head: [['STT', 'Họ tên', 'Giới tính', 'Đời', 'Năm sinh', 'Năm mất', 'Ghi chú']],
        body: tableData,
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        headStyles: {
            fillColor: [34, 139, 34],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 40 },
            2: { cellWidth: 20 },
            3: { cellWidth: 15 },
            4: { cellWidth: 20 },
            5: { cellWidth: 25 },
            6: { cellWidth: 'auto' }
        }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Trang ${i} / ${pageCount} - Gia Phả Họ Đặng Đà Nẵng`,
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    doc.save(`${fileName}.pdf`);
};

// Export to Excel
export const exportToExcel = (members, fileName = 'gia-pha-ho-dang') => {
    const data = members.map((m, i) => ({
        'STT': i + 1,
        'Họ tên': m.fullName,
        'Giới tính': m.gender === 'male' ? 'Nam' : 'Nữ',
        'Đời thứ': m.generation,
        'Năm sinh': m.birthDate ? new Date(m.birthDate).getFullYear() : '',
        'Năm mất': m.deathDate ? new Date(m.deathDate).getFullYear() : '',
        'Trạng thái': m.isDeceased ? 'Đã mất' : 'Còn sống',
        'Ngày giỗ (Âm lịch)': m.anniversaryDate ?
            `${m.anniversaryDate.lunarDay}/${m.anniversaryDate.lunarMonth}` : '',
        'Tiểu sử': m.biography || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Column widths
    worksheet['!cols'] = [
        { wch: 5 },   // STT
        { wch: 25 },  // Họ tên
        { wch: 10 },  // Giới tính
        { wch: 10 },  // Đời thứ
        { wch: 12 },  // Năm sinh
        { wch: 12 },  // Năm mất
        { wch: 12 },  // Trạng thái
        { wch: 15 },  // Ngày giỗ
        { wch: 40 }   // Tiểu sử
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gia Phả');

    // Generate buffer and save
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `${fileName}.xlsx`);
};

// Export to Word
export const exportToWord = async (members, fileName = 'gia-pha-ho-dang') => {
    const doc = new Document({
        sections: [{
            children: [
                // Title
                new Paragraph({
                    text: 'GIA PHẢ HỌ ĐẶNG ĐÀ NẴNG',
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),

                // Subtitle
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                    children: [
                        new TextRun({
                            text: '"Uống nước nhớ nguồn - Ăn quả nhớ kẻ trồng cây"',
                            italics: true,
                            color: '666666'
                        })
                    ]
                }),

                // Date
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                    children: [
                        new TextRun({
                            text: `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
                            size: 20
                        })
                    ]
                }),

                // Table
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        // Header row
                        new TableRow({
                            children: ['STT', 'Họ tên', 'Giới tính', 'Đời', 'Năm sinh', 'Năm mất'].map(text =>
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [new TextRun({ text, bold: true, color: 'FFFFFF' })]
                                    })],
                                    shading: { fill: '228B22' }
                                })
                            )
                        }),
                        // Data rows
                        ...members.map((m, i) =>
                            new TableRow({
                                children: [
                                    String(i + 1),
                                    m.fullName,
                                    m.gender === 'male' ? 'Nam' : 'Nữ',
                                    `Đời ${m.generation}`,
                                    m.birthDate ? String(new Date(m.birthDate).getFullYear()) : '-',
                                    m.deathDate ? String(new Date(m.deathDate).getFullYear()) : (m.isDeceased ? '-' : 'Còn sống')
                                ].map(text =>
                                    new TableCell({
                                        children: [new Paragraph({ text })]
                                    })
                                )
                            })
                        )
                    ]
                }),

                // Stats section
                new Paragraph({
                    spacing: { before: 400 },
                    children: [
                        new TextRun({ text: '\n\nThống kê:', bold: true })
                    ]
                }),
                new Paragraph({
                    children: [new TextRun({ text: `Tổng số thành viên: ${members.length}` })]
                }),
                new Paragraph({
                    children: [new TextRun({
                        text: `Số thế hệ: ${Math.max(...members.map(m => m.generation || 0))}`
                    })]
                })
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
};
