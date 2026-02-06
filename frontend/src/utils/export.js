import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';

// Export to PDF with Vietnamese font support using html2pdf
export const exportToPDF = async (members, options = {}) => {
    const {
        fileName = 'gia-pha-dang-duc-toc',
        title = 'GIA PHẢ ĐẶNG ĐỨC TỘC',
        slogan = 'Uống nước nhớ nguồn - Ăn quả nhớ kẻ trồng cây'
    } = options;

    // Create HTML content for PDF
    const html = `
        <div style="font-family: 'Times New Roman', serif; padding: 20px;">
            <h1 style="color: #228B22; text-align: center; margin-bottom: 10px;">
                ${title}
            </h1>
            <p style="text-align: center; color: #666; font-style: italic; margin-bottom: 10px;">
                "${slogan}"
            </p>
            <p style="text-align: center; color: #666; margin-bottom: 20px;">
                Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}
            </p>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #228B22; color: white;">
                        <th style="border: 1px solid #ddd; padding: 8px;">STT</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Họ tên</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Giới tính</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Đời</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Năm sinh</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Năm mất</th>
                    </tr>
                </thead>
                <tbody>
                    ${members.map((m, i) => `
                        <tr style="background: ${i % 2 === 0 ? '#fff' : '#f5f5f5'};">
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${i + 1}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${m.fullName || ''}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${m.gender === 'male' ? 'Nam' : 'Nữ'}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">Đời ${m.generation || '-'}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${m.birthDate ? new Date(m.birthDate).getFullYear() : '-'}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${m.deathDate ? new Date(m.deathDate).getFullYear() : (m.isDeceased ? '-' : 'Còn sống')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p style="text-align: center; color: #999; margin-top: 20px; font-size: 10px;">
                ${title} - Tổng số: ${members.length} thành viên
            </p>
        </div>
    `;

    // Create temporary element
    const element = document.createElement('div');
    element.innerHTML = html;
    document.body.appendChild(element);

    // PDF options
    const opt = {
        margin: 10,
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate PDF
    await html2pdf().set(opt).from(element).save();

    // Clean up
    document.body.removeChild(element);
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
