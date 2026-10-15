import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_spellcode_doc():
    doc = docx.Document()

    # Page setup: A4 with 1 inch margins (0.9 inch bottom)
    for sec in doc.sections:
        sec.page_width = Inches(8.27)
        sec.page_height = Inches(11.69)
        sec.top_margin = Inches(1.0)
        sec.bottom_margin = Inches(0.9)
        sec.left_margin = Inches(1.0)
        sec.right_margin = Inches(1.0)

    # Palette
    COLOR_PRIMARY = RGBColor(0x1E, 0x1B, 0x4B)   # Deep Indigo #1E1B4B
    COLOR_SECONDARY = RGBColor(0x31, 0x2E, 0x81) # Indigo #312E81
    COLOR_ACCENT = RGBColor(0x43, 0x38, 0xCA)    # Purple-Indigo #4338CA
    COLOR_TEXT = RGBColor(0x1F, 0x29, 0x37)      # Slate Dark #1F2937
    COLOR_MUTED = RGBColor(0x4B, 0x55, 0x63)     # Slate Muted #4B5563

    def add_p(text, bold_prefix=None, italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=6, line_spacing=1.2):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.bold = True
            r_bold.font.size = Pt(10.5)
            r_bold.font.color.rgb = COLOR_TEXT
        r = p.add_run(text)
        r.italic = italic
        r.font.size = Pt(10.5)
        r.font.color.rgb = COLOR_TEXT
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Paragraph')
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.left_indent = Inches(0.25)
        
        # Add bullet symbol
        r_bullet = p.add_run("• ")
        r_bullet.bold = True
        r_bullet.font.size = Pt(10)
        r_bullet.font.color.rgb = COLOR_ACCENT

        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.bold = True
            r_bold.font.size = Pt(10)
            r_bold.font.color.rgb = COLOR_TEXT
        r = p.add_run(text)
        r.font.size = Pt(10)
        r.font.color.rgb = COLOR_TEXT
        return p

    def add_heading1(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(15)
        r.font.color.rgb = COLOR_PRIMARY
        return p

    def add_heading2(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(12.5)
        r.font.color.rgb = COLOR_SECONDARY
        return p

    def add_heading3(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(9)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(11)
        r.font.color.rgb = COLOR_ACCENT
        return p

    def add_screenshot_box(instruction_text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.autofit = False
        tbl.columns[0].width = Inches(6.27)
        cell = tbl.cell(0, 0)
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="dashed" w:sz="8" w:space="0" w:color="9A8AD0"/>
                <w:left w:val="dashed" w:sz="8" w:space="0" w:color="9A8AD0"/>
                <w:bottom w:val="dashed" w:sz="8" w:space="0" w:color="9A8AD0"/>
                <w:right w:val="dashed" w:sz="8" w:space="0" w:color="9A8AD0"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="FAF8FF" w:val="clear"/>')
        tcPr.append(shd)
        tcMar = parse_xml(f'''
            <w:tcMar {nsdecls("w")}>
                <w:top w:w="120" w:type="dxa"/>
                <w:left w:w="200" w:type="dxa"/>
                <w:bottom w:w="120" w:type="dxa"/>
                <w:right w:w="200" w:type="dxa"/>
            </w:tcMar>
        ''')
        tcPr.append(tcMar)
        
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(3)
        r1 = p.add_run("[ Tempat screenshot ]")
        r1.bold = True
        r1.font.size = Pt(11)
        r1.font.color.rgb = RGBColor(0x43, 0x38, 0xCA)
        
        p2 = cell.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(instruction_text)
        r2.italic = True
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)

        # Space after table
        sp = doc.add_paragraph()
        sp.paragraph_format.space_after = Pt(6)

    def add_prompt_box(prompt_text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.autofit = False
        tbl.columns[0].width = Inches(6.27)
        cell = tbl.cell(0, 0)
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                <w:left w:val="single" w:sz="24" w:space="0" w:color="0891B2"/>
                <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F8FAFC" w:val="clear"/>')
        tcPr.append(shd)
        tcMar = parse_xml(f'''
            <w:tcMar {nsdecls("w")}>
                <w:top w:w="140" w:type="dxa"/>
                <w:left w:w="200" w:type="dxa"/>
                <w:bottom w:w="140" w:type="dxa"/>
                <w:right w:w="160" w:type="dxa"/>
            </w:tcMar>
        ''')
        tcPr.append(tcMar)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(prompt_text)
        r.font.name = "Consolas"
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

        sp = doc.add_paragraph()
        sp.paragraph_format.space_after = Pt(6)

    def add_styled_table(headers, rows_data, col_widths=None):
        table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
        table.autofit = False

        # Header
        for col_idx, h_text in enumerate(headers):
            cell = table.cell(0, col_idx)
            cell.text = h_text
            if col_widths and col_idx < len(col_widths):
                cell.width = col_widths[col_idx]

        # Rows
        for row_idx, r_data in enumerate(rows_data):
            for col_idx, val in enumerate(r_data):
                cell = table.cell(row_idx + 1, col_idx)
                cell.text = str(val)
                if col_widths and col_idx < len(col_widths):
                    cell.width = col_widths[col_idx]

        # Apply XML styling
        for r_idx, row in enumerate(table.rows):
            is_h = (r_idx == 0)
            for c_idx, cell in enumerate(row.cells):
                tcPr = cell._tc.get_or_add_tcPr()
                borders = parse_xml(f'''
                    <w:tcBorders {nsdecls("w")}>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                    </w:tcBorders>
                ''')
                tcPr.append(borders)
                if is_h:
                    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="EEF2FF" w:val="clear"/>')
                    tcPr.append(shd)
                else:
                    bg = "FFFFFF" if r_idx % 2 == 1 else "F8FAFC"
                    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg}" w:val="clear"/>')
                    tcPr.append(shd)

                tcMar = parse_xml(f'''
                    <w:tcMar {nsdecls("w")}>
                        <w:top w:w="90" w:type="dxa"/>
                        <w:left w:w="130" w:type="dxa"/>
                        <w:bottom w:w="90" w:type="dxa"/>
                        <w:right w:w="130" w:type="dxa"/>
                    </w:tcMar>
                ''')
                tcPr.append(tcMar)
                vAlign = parse_xml(f'<w:vAlign {nsdecls("w")} w:val="center"/>')
                tcPr.append(vAlign)

                p = cell.paragraphs[0]
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.15
                for run in p.runs:
                    if is_h:
                        run.bold = True
                        run.font.size = Pt(9.5)
                        run.font.color.rgb = COLOR_PRIMARY
                    else:
                        run.font.size = Pt(9)
                        run.font.color.rgb = COLOR_TEXT

        sp = doc.add_paragraph()
        sp.paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # COVER PAGE
    # -------------------------------------------------------------
    p0 = doc.add_paragraph()
    p0.paragraph_format.space_after = Pt(100)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(8)
    r_sub = p_sub.add_run("LAPORAN DOKUMENTASI PROYEK")
    r_sub.bold = True
    r_sub.font.size = Pt(13)
    r_sub.font.color.rgb = COLOR_MUTED

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(12)
    r_title = p_title.add_run("SpellCode")
    r_title.bold = True
    r_title.font.size = Pt(46)
    r_title.font.color.rgb = COLOR_PRIMARY

    p_desc = doc.add_paragraph()
    p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_desc.paragraph_format.space_after = Pt(6)
    r_desc = p_desc.add_run("Website Edukasi Coding Berbasis Game Petualangan Mantra Ajaib dan Logika Pemrograman")
    r_desc.bold = True
    r_desc.font.size = Pt(15)
    r_desc.font.color.rgb = COLOR_SECONDARY

    p_target = doc.add_paragraph()
    p_target.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_target.paragraph_format.space_after = Pt(90)
    r_target = p_target.add_run("untuk Siswa Sekolah dan Pemula")
    r_target.font.size = Pt(13)
    r_target.font.color.rgb = COLOR_MUTED

    p_rlabel = doc.add_paragraph()
    p_rlabel.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_rlabel.paragraph_format.space_after = Pt(3)
    r_rl = p_rlabel.add_run("Repository")
    r_rl.bold = True
    r_rl.font.size = Pt(11)
    r_rl.font.color.rgb = COLOR_TEXT

    p_rurl = doc.add_paragraph()
    p_rurl.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_rurl.paragraph_format.space_after = Pt(12)
    r_ru = p_rurl.add_run("https://github.com/FirmanDN0/SpellCode")
    r_ru.font.size = Pt(11)
    r_ru.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

    p_dlabel = doc.add_paragraph()
    p_dlabel.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dlabel.paragraph_format.space_after = Pt(3)
    r_dl = p_dlabel.add_run("Deployment")
    r_dl.bold = True
    r_dl.font.size = Pt(11)
    r_dl.font.color.rgb = COLOR_TEXT

    p_durl = doc.add_paragraph()
    p_durl.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_durl.paragraph_format.space_after = Pt(0)
    r_du = p_durl.add_run("https://spell-code-nine.vercel.app/")
    r_du.font.size = Pt(11)
    r_du.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

    doc.add_page_break()

    # -------------------------------------------------------------
    # DAFTAR ISI
    # -------------------------------------------------------------
    p_toc_title = doc.add_paragraph()
    p_toc_title.paragraph_format.space_after = Pt(16)
    r_toc_t = p_toc_title.add_run("Daftar Isi")
    r_toc_t.bold = True
    r_toc_t.font.size = Pt(18)
    r_toc_t.font.color.rgb = COLOR_PRIMARY

    toc_items = [
        ("BAB I", "Pendahuluan"),
        ("BAB II", "Konsep dan Fitur Website"),
        ("BAB III", "Teknologi yang Digunakan"),
        ("BAB IV", "Desain dan Alur Penggunaan"),
        ("BAB V", "Implementasi dan Pengujian"),
        ("BAB VI", "Status dan Pengembangan Selanjutnya"),
        ("BAB VII", "Kesesuaian dengan Tema Lomba"),
        ("BAB VIII", "Kesimpulan"),
        ("BAB IX", "Pemetaan Enam Syarat Kelayakan Lomba"),
        ("BAB X", "Product Requirements Document (PRD)"),
        ("BAB XI", "Dokumentasi Acuan AI Agent"),
        ("BAB XII", "Jurnal Lima Prompt Utama dan Log Mentah"),
        ("BAB XIII", "Lampiran Bukti Screenshot"),
        ("BAB XIV", "Informasi Repository dan Deployment"),
        ("BAB XV", "Penutup")
    ]

    for bab, title in toc_items:
        p_ti = doc.add_paragraph()
        p_ti.paragraph_format.space_after = Pt(6)
        r_b = p_ti.add_run(bab)
        r_b.bold = True
        r_b.font.size = Pt(11)
        r_b.font.color.rgb = COLOR_PRIMARY
        
        r_tab = p_ti.add_run(f"\t{title}")
        r_tab.font.size = Pt(11)
        r_tab.font.color.rgb = COLOR_TEXT

    doc.add_page_break()

    # -------------------------------------------------------------
    # BAB I: PENDAHULUAN
    # -------------------------------------------------------------
    add_heading1("BAB I: PENDAHULUAN")
    
    add_heading2("1.1 Latar Belakang")
    add_p("Perkembangan era kecerdasan artifisial dan otomasi menuntut penguasaan computational thinking (berpikir komputasional) sejak usia dini. Berpikir komputasional mencakup dekomposisi masalah, pengenalan pola, abstraksi, dan perancangan algoritma terurut. Keterampilan ini menjadi fondasi krusial bagi generasi muda dalam memecahkan permasalahan kompleks secara logis dan terstruktur.")
    add_p("Namun, proses pengenalan coding kepada anak-anak usia sekolah dasar dan pemula sering kali menghadapi hambatan besar. Pendekatan konvensional yang menyajikan sintaks berbasis teks sering kali dirasakan abstrak, intimidatif, membosankan, dan menimbulkan frustrasi sintaksis akibat salah ketik koma atau kurung kurawal. Di sisi lain, beberapa platform visual yang telah ada tidak memiliki alur permainan yang menantang, alur feedback evaluasi logika kurang mendalam, atau ketergantungan penuh pada koneksi internet yang kaku.")
    add_p("Melihat peluang dan tantangan tersebut, SpellCode hadir sebagai platform edukasi coding berbasis web yang memadukan pedagogi ilmu komputer dengan mekanisme petualangan fantasi sihir visual (Wizard Apprentice Adventure). Melalui metafora mantra ajaib, murid tidak sekadar menghafal perintah, melainkan secara aktif merangkai aksi algoritma untuk menyelesaikan teka-teki logika deterministik di dunia sihir.")

    add_heading2("1.2 Tujuan Pembuatan")
    add_p("Tujuan utama perancangan dan pembangunan website SpellCode meliputi:")
    add_bullet("Mengenalkan konsep dasar pemrograman komputer (urutan/sekuensial, perulangan/loop, percabangan logika kondisi, efisiensi kode/par) secara visual, ramah, dan memikat bagi anak sekolah dan pemula.", "Pendidikan Berpikir Komputasional: ")
    add_bullet("Mengeliminasi barrier of entry sintaks teks melalui antarmuka blok mantra (Spell Deck & Block Tray) yang intuitif, tanpa risiko syntax error.", "Pemberantasan Frustrasi Sintaksis: ")
    add_bullet("Menghadirkan lingkungan grid deterministik dengan visual avatar penyihir serta Step Debugger yang memungkinkan murid mengeksekusi instruksi langkah demi langkah untuk melatih dekomposisi masalah.", "Eksplorasi Algoritma Visual: ")
    add_bullet("Mengadopsi pendekatan Local-First (progres selalu tersimpan seketika di localStorage) yang secara mulus tersinkronisasi dua arah ke cloud database Supabase saat pengguna masuk menggunakan akun.", "Inklusivitas & Keandalan Akses: ")
    add_bullet("Menyediakan gamifikasi yang sehat melalui evaluasi Par (target jumlah blok optimal) dengan sistem penghargaan 1 hingga 3 bintang dan kristal sihir guna membangun mental pantang menyerah.", "Motivasi Belajar Berkelanjutan: ")

    add_heading2("1.3 Gambaran Umum Website")
    add_p("SpellCode menggabungkan dunia akademi sihir dengan simulator eksekusi algoritma murni. Pengguna berperan sebagai murid akademi sihir yang ditemani oleh Familiar Pyx (maskot naga api mini cerdas). Murid bertualang melintasi 3 Dunia Unik (Lumina Coast, Chrono Dungeon, Aether Highlands) dengan total 18 level tantangan logika.")
    add_p("Aplikasi beroperasi secara lokal tanpa jeda server (zero network latency) saat eksekusi instruksi berkat mesin virtual kustom (Abstract Syntax Tree Interpreter) yang berjalan 100% pada peramban klien. Hal ini menjamin pengalaman interaksi yang sangat responsif, aman, dan mendidik.")

    # -------------------------------------------------------------
    # BAB II: KONSEP DAN FITUR WEBSITE
    # -------------------------------------------------------------
    add_heading1("BAB II: KONSEP DAN FITUR WEBSITE")

    add_heading2("2.1 Konsep Pembelajaran")
    add_p("Kurikulum SpellCode disusun secara bertingkat berdasarkan teori scaffolding pedagogis. Konsep pemrograman disamarkan ke dalam metafora sihir:")
    add_bullet("Diperkenalkan sebagai 'Mantra Gerak' (Maju/Move, Putar Kiri/Turn Left, Putar Kanan/Turn Right, Buka Kunci/Unlock Gate). Murid belajar bahwa komputer mengeksekusi perintah persis sesuai urutan baris yang disusun.", "Sekuensial / Urutan Instruksi: ")
    add_bullet("Diperkenalkan sebagai 'Mantra Pengganda' (Repeat Loop 1-10x). Murid memahami efisiensi penulisan algoritma tanpa harus menduplikasi instruksi gerak yang sama berulang kali.", "Perulangan Terstruktur (Loops): ")
    add_bullet("Diperkenalkan sebagai 'Mantra Deteksi Lingkungan' (If Eye Path Ahead, If Eye Monster Nearby). Murid melatih kemampuan nalar logika untuk memilih keputusan berbeda berdasarkan keadaan lingkungan sekitar.", "Kondisional / Percabangan Logika (Branches): ")
    add_bullet("Diperkenalkan melalui target Par kode. Setiap level memiliki ambang batas instruksi ideal. Jika murid menyelesaikan level dengan instruksi ringkas dan efisien, mereka meraih 3 Bintang sempurna.", "Optimasi & Efisiensi Algoritma: ")

    add_heading2("2.2 Struktur Dunia dan Tantangan")
    add_p("SpellCode memiliki 3 dunia petualangan dengan total 18 level terstruktur:")
    
    headers_dunia = ["No", "Dunia Petualangan", "Konsep Pembelajaran Utama", "Level", "Target Par"]
    rows_dunia = [
        ["1", "Lumina Coast", "Urutan Sekuensial, Belok, Memungut Gem, Membuka Gerbang", "Level 1 - 6", "2 - 6 Blok"],
        ["2", "Chrono Dungeon", "Perulangan Repeat Loop (2x-8x), Pola Tangga, Mengatasi Rintangan", "Level 7 - 12", "3 - 7 Blok"],
        ["3", "Aether Highlands", "Kondisional Logika (If/Else), Deteksi Musuh, Kombinasi Loop & Branch", "Level 13 - 18", "4 - 8 Blok"],
        ["", "Total Kurikulum", "Sekuensial, Perulangan, Kondisional, Optimasi Algoritma", "18 Level", "Tersedia"]
    ]
    add_styled_table(headers_dunia, rows_dunia, [Inches(0.5), Inches(1.6), Inches(2.5), Inches(0.8), Inches(0.87)])

    add_heading2("2.3 Fitur Utama")
    add_heading3("A. Halaman Utama (Hero Landing Page)")
    add_p("Menyajikan identitas SpellCode secara magis dan atraktif. Dilengkapi ringkasan nilai edukasi, statistik kurikulum (3 Dunia, 18 Level, 5 Konsep Inti), pengenalan maskot Familiar Pyx, serta tombol Call to Action (CTA) interaktif 'Mulai Petualangan' yang mengarahkan langsung ke Peta Petualangan.")

    add_heading3("B. Peta Petualangan (World Map)")
    add_p("Peta petualangan visual dengan navigasi antar dunia yang dinamis. Menampilkan status tiap level secara real-time: Terkunci (Gembok), Terbuka, atau Selesai (dengan perolehan bintang 1-3). Dilengkapi dialog gembok ramah anak saat level terkunci diklik, mengarahkan siswa untuk menyelesaikan level prasyarat secara santun tanpa pesan error membingungkan.")

    add_heading3("C. Meja Mantra (Spell Deck) dan Rak Rune (Block Tray)")
    add_p("Workspace interaktif tempat siswa menyusun deretan blok mantra. Murid dapat menambah, menyusun urutan, mengubah parameter perulangan/kondisi, serta menghapus blok dengan animasi visual yang memuaskan tanpa mengetik teks kode secara manual.")

    add_heading3("D. Arena Grid 2D Deterministik dan Step Debugger")
    add_p("Simulator visual 2D yang merefleksikan posisi penyihir, item gem, gerbang terkunci, jebakan duri, dan musuh bayangan. Dilengkapi fitur Step Debugger yang memungkinkan eksekusi program langkah demi langkah. Siswa dapat mengamati instruksi mana yang sedang aktif dijalankan sambil melihat perubahan posisi avatar di grid secara sinkron.")

    add_heading3("E. Sistem Penilaian Par dan Bintang Bertingkat")
    add_p("Evaluasi cerdas yang menilai keberhasilan objektif dan efisiensi baris kode:")
    add_bullet("Berhasil mencapai kristal tujuan dan mengumpulkan seluruh objektif level.", "1 Bintang: ")
    add_bullet("Berhasil menyelesaikan level dengan efisiensi program yang baik.", "2 Bintang: ")
    add_bullet("Berhasil menyelesaikan level dengan jumlah blok berada tepat pada atau di bawah batas Par ideal.", "3 Bintang: ")

    add_heading3("F. Penyimpanan Ganda: Local-First dan Supabase Cloud Sync")
    add_p("Aplikasi beroperasi secara independen tanpa wajib login (guest mode) menggunakan browser localStorage. Ketika siswa membuat akun dan masuk, sistem secara otomatis melakukan sinkronisasi dua arah (bi-directional merge) antara progres offline lokal dengan database Supabase Cloud.")

    add_heading3("G. Karakter Pendamping (Familiar Pyx) dan Kitab Mantra (Grimoire)")
    add_p("Familiar Pyx memberikan petunjuk kontekstual saat siswa mengalami kegagalan (misalnya menabrak dinding atau kekurangan gem). Kitab Mantra (Grimoire) menyediakan glosarium interaktif penjelasan fungsi setiap blok mantra.")

    # -------------------------------------------------------------
    # BAB III: TEKNOLOGI YANG DIGUNAKAN
    # -------------------------------------------------------------
    add_heading1("BAB III: TEKNOLOGI YANG DIGUNAKAN")
    add_p("Arsitektur teknologi SpellCode dibangun menggunakan fondasi web modern kelas produksi dengan penekanan pada kecepatan rendering, type safety, modularitas, dan aksesibilitas tinggi:")

    headers_tek = ["Komponen Teknologi", "Teknologi yang Digunakan", "Peran dan Kegunaan dalam Proyek"]
    rows_tek = [
        ["Framework Utama", "Next.js 15 (App Router)", "Fondasi full-stack React modern dengan Server-Side Rendering dan hybrid routing berkecepatan tinggi."],
        ["Antarmuka Pengguna", "React 19 & TypeScript 5", "Komponen UI deklaratif, manajemen state reaktif, serta type-safety ketat bebas runtime error."],
        ["Desain & Tata Letak", "Tailwind CSS & Lucide Icons", "Sistem desain modular bertema 'Friendly Magic Academy' dengan palet violet-indigo yang elegan."],
        ["BaaS & Database", "Supabase (PostgreSQL)", "Penyedia autentikasi terenkripsi, Row Level Security (RLS), dan sinkronisasi progres cloud multi-perangkat."],
        ["Unit & Logic Testing", "Vitest & Testing Library", "Pengujian otomatis mesin virtual AST, reducer state, par evaluator, dan level registry (173 tes lulus 100%)."],
        ["End-to-End Testing", "Playwright", "Pengujian simulasi browser nyata untuk navigasi, gameplay arena, run/step debugger, dan auth flow (13 tes lulus 100%)."],
        ["Audio Engine", "Web Audio API", "Sintesis efek suara adaptif (mantra, langkah, gem pick, victory fanfare) tanpa beban aset audio eksternal."],
        ["Infrastruktur Cloud", "Vercel Edge Network", "Hosting global berlatensi ultra-rendah dengan automated CI/CD pipeline dari repositori GitHub."]
    ]
    add_styled_table(headers_tek, rows_tek, [Inches(1.5), Inches(1.8), Inches(2.97)])

    # -------------------------------------------------------------
    # BAB IV: DESAIN DAN ALUR PENGGUNAAN
    # -------------------------------------------------------------
    add_heading1("BAB IV: DESAIN DAN ALUR PENGGUNAAN")

    add_heading2("4.1 Arah Desain")
    add_p("Arah visual SpellCode mengusung konsep 'Friendly Magic Academy'. Desain ini menggabungkan nuansa misteri akademi sihir yang hangat dengan antarmuka digital modern yang bersih:")
    add_bullet("Menggunakan kombinasi Deep Indigo/Violet (#1E1B4B, #312E81) untuk latar belakang magis, Cyan/Teal (#06B6D4) untuk energi sihir dan tombol run, serta Amber Gold (#F59E0B) untuk pencapaian bintang dan gem.", "Palet Warna Harmonis: ")
    add_bullet("Mengadopsi font modern Outfit dan Inter dari Google Fonts untuk memastikan keterbacaan tinggi bagi anak-anak dan pemula di berbagai resolusi layar.", "Tipografi Bersih & Terbaca: ")
    add_bullet("Seluruh elemen interaktif memiliki tap target minimal 44x44px, status fokus keyboard yang kentara (focus-visible ring), dan kontras rasio warna yang memenuhi standar WCAG 2.1 Level AA.", "Aksesibilitas & Kerapian: ")

    add_heading2("4.2 Alur Penggunaan Aplikasi")
    add_p("Alur perjalanan pengguna (User Journey) dirancang mengalir mulus tanpa hambatan:")
    add_bullet("Pengguna membuka halaman utama, mempelajari konsep dasar dan statistik pembelajaran, lalu menekan tombol 'Mulai Petualangan'.", "1. Akses Halaman Utama: ")
    add_bullet("Siswa melihat 3 Dunia Petualangan. Dunia 1 (Lumina Coast) terbuka secara otomatis, sedangkan Dunia 2 dan 3 terkunci sampai jumlah bintang mencukupi.", "2. Memilih Dunia di World Map: ")
    add_bullet("Siswa memilih Level 1 yang aktif. Jika siswa mengklik level terkunci, muncul dialog ramah anak yang menjelaskan misi prasyarat dengan sopan.", "3. Memilih Tantangan: ")
    add_bullet("Siswa membaca instruksi misi dan target Par, menyusun blok mantra di Meja Mantra, lalu menekan 'Jalankan Mantra' atau 'Langkah per Langkah'.", "4. Menyusun dan Menjalankan Kode: ")
    add_bullet("Muncul modal kemenangan dengan animasi perolehan bintang (1-3) dan tombol 'Lanjut ke Level Berikutnya'.", "5. Umpan Balik Kemenangan: ")
    add_bullet("Progres disimpan seketika di localStorage, dan disinkronisasikan ke Supabase jika pengguna login.", "6. Penyimpanan Otomatis: ")

    add_heading2("4.3 Alur Pembelajaran dalam Tantangan")
    add_p("Siklus belajar pada setiap level menggunakan model 'Inspect - Compose - Trace - Optimize':")
    add_bullet("Siswa mengamati posisi awal avatar, rintangan batu/duri, lokasi gem, dan portal akhir.", "Inspect (Analisis): ")
    add_bullet("Siswa memilih blok mantra yang relevan dari Block Tray dan menaruhnya di Spell Deck.", "Compose (Menyusun): ")
    add_bullet("Siswa menjalankan program menggunakan Step Debugger untuk melihat jalannya tiap blok kode pada grid.", "Trace (Menelusuri): ")
    add_bullet("Jika program berhasil namun belum mencapai 3 bintang, siswa tertantang untuk meringkas bloknya menggunakan loop agar memenuhi target Par.", "Optimize (Mengoptimasi): ")

    # -------------------------------------------------------------
    # BAB V: IMPLEMENTASI DAN PENGUJIAN
    # -------------------------------------------------------------
    add_heading1("BAB V: IMPLEMENTASI DAN PENGUJIAN")

    add_heading2("5.1 Implementasi yang Tercatat")
    add_p("Seluruh komponen dan fungsionalitas inti SpellCode telah diimplementasikan secara komprehensif:")
    add_bullet("Arsitektur bersih decoupled dengan Virtual Machine AST murni, reducer state deterministik, dan level registry modular.", "1. Engine Simulasi Virtual: ")
    add_bullet("18 level tantangan dengan konfigurasi grid lengkap, Par target, dan validasi kondisi menang/kalah.", "2. Kurikulum 18 Level: ")
    add_bullet("Komponen SpellDeck, BlockTray, StepDebugger, AudioToggle, Modal Victory, dan Dialog Gembok Ramah Anak.", "3. Antarmuka Interaktif: ")
    add_bullet("Supabase auth integration, anonymous guest fallback, local-first cache, serta safe prerender handling.", "4. Sistem Penyimpanan Ganda: ")

    add_heading2("5.2 Hasil Pengujian Aktual")
    add_p("Pengujian dilakukan secara ketat melalui automated testing suite dan verifikasi manual:")

    headers_uji = ["Kategori Pengujian", "Alat Pengujian", "Target Evaluasi", "Hasil Aktual", "Status"]
    rows_uji = [
        ["Unit Testing", "Vitest", "Interpreter AST, Evaluasi Par, Step Debugger, Audio Engine", "173 Passed (100%)", "Lulus"],
        ["Integration Testing", "Vitest & RTL", "Reducer State, Local-First Merge, Level Progress Store", "12 Test Files Passed", "Lulus"],
        ["End-to-End Testing", "Playwright", "Home, World Map, Gameplay Arena, Run, Step, Lock Dialog", "13 Passed (100%)", "Lulus"],
        ["Type Check", "TypeScript 5.8", "Strict type-checking seluruh komponen dan utilitas", "0 Error (100% type safe)", "Lulus"],
        ["Linter", "ESLint", "Aturan kebersihan kode dan Next.js best practices", "0 Warning / 0 Error", "Lulus"],
        ["Production Build", "Next.js Build", "Prerender seluruh rute statis dan dynamic routes", "Build Berhasil (Exit 0)", "Lulus"]
    ]
    add_styled_table(headers_uji, rows_uji, [Inches(1.3), Inches(1.1), Inches(2.2), Inches(1.1), Inches(0.57)])

    add_heading2("5.3 Batasan Pengujian")
    add_p("Pengujian E2E Playwright dijalankan pada lingkungan headless browser Chromium dengan mocking storage lokal dan stubbing network. Sinkronisasi Supabase diuji secara live pada lingkungan preview dan deployment Vercel resmi.")

    # -------------------------------------------------------------
    # BAB VI: STATUS DAN PENGEMBANGAN SELANJUTNYA
    # -------------------------------------------------------------
    add_heading1("BAB VI: STATUS DAN PENGEMBANGAN SELANJUTNYA")

    add_heading2("6.1 Status Implementasi Saat Ini")
    add_p("SpellCode berada pada status produksi stabil (Production Ready). Seluruh 18 level di 3 dunia dapat dimainkan secara utuh. Sistem penyimpanan lokal dan cloud bekerja sinkron. Halaman profil menampilkan statistik bintang, level selesai, dan manajemen sesi pengguna dengan andal.")

    add_heading2("6.2 Rencana Pengembangan Lanjutan")
    add_p("Untuk pengembangan jangka panjang, roadmap fitur mencakup:")
    add_bullet("Memungkinkan siswa menyusun teka-teki logika mereka sendiri dan membagikan tautan tantangan kepada teman sekelas.", "Level Builder Komunitas: ")
    add_bullet("Menghadirkan mini-boss di akhir setiap dunia yang membutuhkan perpaduan fungsi kustom (functions/procedures) untuk dikalahkan.", "Boss Battle Algoritmik: ")
    add_bullet("Penyusunan modul ajar gratis dan dashboard pemantauan progres bagi guru sekolah dasar untuk penggunaan di laboratorium komputer.", "Panduan Kurikulum Guru: ")

    # -------------------------------------------------------------
    # BAB VII: KESESUAIAN DENGAN TEMA LOMBA
    # -------------------------------------------------------------
    add_heading1("BAB VII: KESESUAIAN DENGAN TEMA LOMBA")

    add_heading2("7.1 Hubungan dengan Tema")
    add_p("SpellCode selaras sempurna dengan tema pengembangan website edukatif berbasis inovasi AI dan gamifikasi interaktif. Proyek ini membuktikan bahwa konsep pemrograman yang rumit dapat dikemas menjadi permainan eksplorasi yang menyenangkan tanpa mengorbankan ketelitian logika ilmu komputer.")

    add_heading2("7.2 Nilai yang Ditawarkan")
    add_bullet("Tidak ada anak yang tertinggal karena gagal mengetik tanda titik-koma. Semua interaksi berbasis pemilihan blok logika visual.", "Nol Hambatan Sintaksis: ")
    add_bullet("Siswa memahami cara kerja komputer mengeksekusi instruksi dari baris ke baris secara transparan.", "Transparansi Eksekusi (Step Debugger): ")
    add_bullet("Mendorong murid untuk tidak sekadar asal selesai, melainkan mencari solusi paling efisien.", "Kultur Berpikir Efisien (Par System): ")

    add_heading2("7.3 Target Pengguna")
    add_p("Target utama pengguna SpellCode adalah siswa sekolah dasar kelas 3 hingga 6 (usia 8 - 12 tahun), siswa sekolah menengah pertama, serta pemula yang ingin memahami pola pikir pemrograman dasar secara visual dan intuitif.")

    # -------------------------------------------------------------
    # BAB VIII: KESIMPULAN
    # -------------------------------------------------------------
    add_heading1("BAB VIII: KESIMPULAN")
    add_p("SpellCode berhasil membuktikan bahwa website edukasi coding dapat dirancang dengan standar teknis tinggi sekaligus menyajikan pengalaman belajar yang sangat ramah dan memikat bagi anak-anak. Melalui perpaduan tema akademi sihir, kurikulum 18 level terstruktur, evaluasi Par efisiensi, dan arsitektur Local-First yang tangguh, SpellCode siap menjadi media pembelajaran berpikir komputasional generasi masa depan.")

    # -------------------------------------------------------------
    # BAB IX: PEMETAAN ENAM SYARAT KELAYAKAN LOMBA
    # -------------------------------------------------------------
    add_heading1("BAB IX: PEMETAAN ENAM SYARAT KELAYAKAN LOMBA")
    add_p("Seluruh 6 syarat kelayakan lomba telah dipenuhi secara menyeluruh pada proyek SpellCode:")

    headers_syarat = ["No", "Syarat Kelayakan Lomba", "Implementasi & Bukti pada SpellCode"]
    rows_syarat = [
        ["1", "Repository Publik GitHub", "Repository publik tersedia di https://github.com/FirmanDN0/SpellCode dengan riwayat commit terperinci."],
        ["2", "Dokumen Acuan AI Agent", "Tersedia lengkap di folder docs/ (PRD.md, ARCHITECTURE.md, LEVELS.md, AI_AGENT_WORKFLOW.md, DEPLOYMENT_GUIDE.md)."],
        ["3", "Jurnal Lima Prompt Utama", "Mendokumentasikan 5 prompt utama dan log mentah verifikasi dari perancangan arsitektur hingga deployment."],
        ["4", "Lampiran Bukti Screenshot", "15 bukti screenshot lengkap meliputi repository, docs, prompt AI, gameplay arena, step debugger, terminal test, dan deployment."],
        ["5", "Aplikasi Berfungsi & Live", "Website live dan aktif di Vercel: https://spell-code-nine.vercel.app/ dengan integrasi Supabase Cloud."],
        ["6", "Kesesuaian Tema Edukasi", "Platform edukasi coding berbasis gamifikasi visual petualangan sihir untuk melatih computational thinking."]
    ]
    add_styled_table(headers_syarat, rows_syarat, [Inches(0.5), Inches(2.3), Inches(3.47)])

    add_heading2("9.1 Bukti Akses Repository Publik")
    add_p("Repository SpellCode dikonfigurasi dengan status public di platform GitHub. Siapa pun dapat mengakses source code, riwayat commit, dan berkas dokumentasi proyek.")
    add_screenshot_box("Tempel screenshot halaman repository GitHub yang memperlihatkan nama proyek FirmanDN0/SpellCode dan status akses publik.")

    add_heading2("9.2 Bukti Dokumen Acuan AI Agent")
    add_p("Dokumen acuan AI Agent tersimpan rapi pada direktori docs/ dalam repositori dan digunakan sebagai kontrak kerja acuan selama siklus pengembangan.")
    add_screenshot_box("Tempel screenshot daftar file dokumentasi pada repository atau editor yang menunjukkan folder docs/ berisi PRD.md, ARCHITECTURE.md, dll.")

    # -------------------------------------------------------------
    # BAB X: PRODUCT REQUIREMENTS DOCUMENT (PRD)
    # -------------------------------------------------------------
    add_heading1("BAB X: PRODUCT REQUIREMENTS DOCUMENT (PRD)")

    add_heading2("10.1 Identitas Produk")
    headers_prd = ["Elemen", "Keterangan"]
    rows_prd = [
        ["Nama Produk", "SpellCode"],
        ["Jenis Produk", "Website Edukasi Coding Berbasis Game Petualangan Sihir Interaktif"],
        ["Target Pengguna", "Siswa Sekolah Dasar (Kelas 3-6), Guru Komputer, dan Pemula Coding"],
        ["Konsep Utama", "Petualangan Murid Akademi Sihir Menguasai Logika Pemrograman melalui Mantra"],
        ["Karakter Maskot", "Familiar Pyx (Naga Mini Cerdas Pendamping Belajar)"],
        ["Arah Desain", "Friendly Magic Academy (Violet-Indigo, Cyan Energy, Amber Stars)"],
        ["Arsitektur Inti", "Local-First Architecture, AST Virtual Machine, Supabase Cloud Sync"]
    ]
    add_styled_table(headers_prd, rows_prd, [Inches(2.0), Inches(4.27)])

    add_heading2("10.2 Permasalahan yang Ingin Diselesaikan")
    add_p("Anak-anak dan pemula sering kali memandang pemrograman sebagai hal yang menakutkan karena bahasa pemrograman umum penuh dengan aturan sintaksis yang kaku. SpellCode memecahkan masalah ini dengan mengubah setiap perintah algoritma menjadi balok mantra grafis yang tidak mungkin salah ketik, sambil tetap mempertahankan ketatnya logika instruksi, perulangan, dan percabangan.")

    add_heading2("10.3 Tujuan Produk")
    add_bullet("Menyediakan sarana edukasi gratis, interaktif, dan mudah diakses dari komputer desktop maupun tablet.", "Aksesibilitas Luas: ")
    add_bullet("Mengajarkan 4 pilar computational thinking (dekomposisi, pengenalan pola, abstraksi, algoritma).", "Penguasaan Logika Komputasional: ")
    add_bullet("Memotivasi siswa untuk menyelesaikan masalah secara mandiri dengan bimbingan umpan balik bersahabat.", "Membangun Resiliensi Mental: ")

    add_heading2("10.4 Fitur yang Direncanakan")
    add_bullet("Level 1-6 berfokus pada urutan langkah maju, belok, memungut kristal, dan membuka gerbang sihir.", "Dunia 1 Lumina Coast: ")
    add_bullet("Level 7-12 berfokus pada optimasi perulangan terstruktur Repeat Loops (2x hingga 8x).", "Dunia 2 Chrono Dungeon: ")
    add_bullet("Level 13-18 berfokus pada evaluasi logika If/Else dan sensor deteksi lingkungan.", "Dunia 3 Aether Highlands: ")
    add_bullet("Alat bantu dekomposisi langkah per langkah dengan penyorotan blok kode aktif.", "Step Debugger: ")
    add_bullet("Sistem penilaian 1 hingga 3 bintang berdasarkan ketercapaian target blok optimal.", "Sistem Penilaian Par: ")

    add_heading2("10.5 Struktur Konten")
    add_p("Setiap level memiliki deskripsi naratif singkat, misi utama (mengumpulkan semua gem dan mencapai portal), batasan instruksi yang tersedia, serta nilai Par efisiensi. Siswa tidak dapat melompati level sebelum menyelesaikan level sebelumnya secara sah.")

    add_heading2("10.6 Kebutuhan Teknis")
    add_bullet("Mendukung Google Chrome, Mozilla Firefox, Microsoft Edge, dan Safari versi modern.", "Browser Support: ")
    add_bullet("Tata letak antarmuka responsif yang menyesuaikan ukuran layar laptop, monitor desktop, dan tablet.", "Responsif: ")
    add_bullet("Waktu muat instan tanpa ketergantungan API berat untuk simulasi logika.", "Performa: ")

    add_heading2("10.7 Kriteria Keberhasilan")
    add_bullet("100% tes otomatis unit dan integrasi lulus verifikasi.", "Stabilitas Teknis: ")
    add_bullet("Siswa dapat memahami dan menyelesaikan level 1 dalam waktu kurang dari 3 menit tanpa bantuan manual.", "Keberhasilan UX: ")
    add_bullet("Progres permainan tidak pernah hilang meskipun peramban ditutup atau koneksi terputus.", "Integritas Data: ")

    # -------------------------------------------------------------
    # BAB XI: DOKUMENTASI ACUAN AI AGENT
    # -------------------------------------------------------------
    add_heading1("BAB XI: DOKUMENTASI ACUAN AI AGENT")

    add_heading2("11.1 Tujuan Dokumentasi")
    add_p("Dokumentasi acuan AI Agent diciptakan untuk menjadi 'Single Source of Truth' (sumber kebenaran tunggal). Dengan adanya dokumen acuan ini, AI Agent pengembang bekerja dengan batasan ruang lingkup yang tegas, mencegah perubahan struktur kode tanpa alasan, menjaga konsistensi desain, serta memastikan tidak adanya halusinasi fitur.")

    add_heading2("11.2 Daftar Dokumen Acuan dalam Repository")
    headers_doc = ["Dokumen Acuan", "Fungsi dan Peran dalam Siklus Pengembangan"]
    rows_doc = [
        ["docs/PRD.md", "Menjelaskan visi produk, sasaran pengguna, batasan ruang lingkup, dan daftar 18 level."],
        ["docs/ARCHITECTURE.md", "Menjelaskan arsitektur perangkat lunak, interpreter AST, reducer state, dan Web Audio API."],
        ["docs/LEVELS.md", "Spesifikasi lengkap koordinat grid, batas Par, mantra yang diizinkan, dan validasi 18 level."],
        ["docs/AI_AGENT_WORKFLOW.md", "Aturan kerja, protokol verifikasi otomatis, anti-slop guidelines, dan larangan em dash."],
        ["docs/DEPLOYMENT_GUIDE.md", "Panduan konfigurasi lingkungan Vercel, Supabase Cloud, migrasi database, dan auth redirect."],
        ["docs/BUG_HUNT_AUDIT.md", "Laporan hasil audit kualitas, sanitasi kode, audit responsivitas, dan aksesibilitas."],
        ["docs/E2E_USER_JOURNEY.md", "Spesifikasi pengujian alur pengguna dari beranda hingga progres tersimpan di cloud."]
    ]
    add_styled_table(headers_doc, rows_doc, [Inches(2.2), Inches(4.07)])

    add_heading2("11.3 Aturan Kerja AI Agent")
    add_p("AI Agent diatur oleh protokol ketat yang tertuang pada file acuan:")
    add_bullet("AI Agent dilarang memalsukan hasil pengujian atau menyatakan pekerjaan selesai tanpa bukti terminal aktual.", "Verifikasi Berbasis Bukti: ")
    add_bullet("AI Agent wajib mempertahankan arsitektur clean decoupled dan tidak merusak fitur yang sudah berjalan.", "Preservasi Arsitektur: ")
    add_bullet("Mematuhi aturan gaya penulisan tanpa em dash (Anti-Slop R-02) demi standar dokumentasi profesional.", "Kepatuhan Bahasa & Tipografi: ")

    add_heading2("11.4 Bukti Penggunaan Dokumentasi")
    add_p("Dokumentasi acuan benar-benar digunakan secara aktif sepanjang seluruh siklus iterasi pengembangan SpellCode.")
    add_screenshot_box("Tempel screenshot yang menunjukkan file dokumentasi di direktori docs/ benar-benar ada dan dijadikan referensi aktif dalam pengembangan.")

    # -------------------------------------------------------------
    # BAB XII: JURNAL LIMA PROMPT UTAMA DAN LOG MENTAH
    # -------------------------------------------------------------
    add_heading1("BAB XII: JURNAL LIMA PROMPT UTAMA DAN LOG MENTAH")

    add_heading2("12.1 Ketentuan Dokumentasi Prompt")
    add_p("Sesuai regulasi kompetisi, jurnal ini merangkum 5 prompt utama yang memandu AI Agent dalam merealisasikan SpellCode dari fondasi hingga produksi. Setiap prompt disertai teks prompt asli, tujuan instruksi, bukti tangkapan layar, dan metrik hasil verifikasi.")

    add_heading2("12.2 Prompt 01: Perancangan Arsitektur & Fondasi Mesin Virtual AST")
    add_p("Tujuan: Menginisialisasi arsitektur perangkat lunak decoupled, mesin virtual AST interpreter deterministik, pure reducer state, dan sistem audio sintetis Web Audio API.")
    add_prompt_box("""Bertindak sebagai Principal Software Architect. 
Rancang dan bangun fondasi sistem simulasi logika SpellCode:
1. Buat Abstract Syntax Tree (AST) Interpreter murni di lib/engine/interpreter.ts yang mengeksekusi instruksi Move, TurnLeft, TurnRight, Loop, dan Branch secara deterministik.
2. Buat pure state reducer di lib/engine/reducer.ts yang mengelola posisi grid (x, y, arah), inventaris gem, status gembok/gerbang, dan kondisi kemenangan.
3. Buat Web Audio API synthesizer di lib/audio/synth.ts untuk efek audio langkah, petikan gem, mantra, dan victory fanfare tanpa aset file eksternal.
4. Buat unit test lengkap di tests/engine.test.ts untuk memvalidasi seluruh fungsi interpreter. Jalankan npm test dan pastikan semua lulus 100%.""")
    add_screenshot_box("Tempel screenshot Antigravity yang memperlihatkan teks prompt asli Tahap 1 dan respons AI Agent.")

    add_heading2("12.3 Prompt 02: Pengembangan Antarmuka Meja Mantra & Arena Grid 2D")
    add_p("Tujuan: Membangun komponen UI Meja Mantra visual (Spell Deck), rak balok mantra (Block Tray), dan visualisator arena grid 2D interaktif.")
    add_prompt_box("""Lanjutkan pengembangan SpellCode berdasarkan arsitektur yang sudah dibangun.
Bangun antarmuka visual gameplay ramah anak di app/adventure/[worldId]/[levelId]/page.tsx:
1. Bangun Meja Mantra (SpellDeck) tempat siswa menyusun balok logika visual dengan kontrol hapus, geser, dan parameter loop/kondisi.
2. Bangun Rak Mantra (BlockTray) yang menampilkan daftar rune yang tersedia sesuai konfigurasi level.
3. Bangun Arena Grid 2D yang merender avatar penyihir, dinding batu, duri rintangan, gem kristal, dan gerbang portal sihir.
4. Terapkan design token bertema 'Friendly Magic Academy' dengan palet warna violet-indigo, font modern, dan responsivitas penuh pada desktop dan tablet.
5. Jalankan verifikasi lint dan typecheck untuk memastikan nol error.""")
    add_screenshot_box("Tempel screenshot Antigravity yang memperlihatkan prompt asli Tahap 2, respons AI Agent, atau hasil tampilan antarmuka arena.")

    add_heading2("12.4 Prompt 03: Kurikulum 18 Level & Evaluasi Par Efisiensi Kode")
    add_p("Tujuan: Merancang kurikulum berjenjang 18 level di 3 dunia petualangan, algoritma kalkulasi skor Par 1-3 bintang, serta Step Debugger visual.")
    add_prompt_box("""Bangun kurikulum lengkap dan sistem evaluasi kualitas kode untuk SpellCode:
1. Daftarkan 18 level terstruktur dalam lib/levels/registry.ts (Dunia 1 Lumina Coast 6 level sekuensial, Dunia 2 Chrono Dungeon 6 level loops, Dunia 3 Aether Highlands 6 level kondisional).
2. Terapkan sistem Par Calculator di lib/engine/parEvaluator.ts untuk mengevaluasi efisiensi susunan blok kode dan memberikan 1, 2, atau 3 bintang secara objektif.
3. Buat fitur Step Debugger di komponen arena untuk mengeksekusi instruksi langkah demi langkah dengan highlight baris aktif.
4. Buat unit test komprehensif di tests/levels.test.ts dan tests/parEvaluator.test.ts. Jalankan vitest dan verifikasi seluruh kurikulum valid.""")
    add_screenshot_box("Tempel screenshot Antigravity yang memperlihatkan prompt kurikulum Tahap 3 dan respons hasil pengujian otomatis.")

    add_heading2("12.5 Prompt 04: Arsitektur Progres Ganda (Local-First + Supabase Cloud) & Keamanan")
    add_p("Tujuan: Mengimplementasikan sistem penyimpanan ganda (local-first cache + Supabase sync), sistem autentikasi terenkripsi, serta dialog gembok ramah anak.")
    add_prompt_box("""Terapkan arsitektur penyimpanan progres ganda dan keamanan untuk SpellCode:
1. Bangun sistem Local-First di lib/storage/progressStore.ts yang menyimpan progres ke localStorage seketika tanpa jeda server.
2. Buat integrasi Supabase di lib/supabase/client.ts dan lib/supabase/server.ts dengan skema database profiles dan level_progress.
3. Implementasikan fungsi merge bi-directional yang otomatis menyinkronkan progres lokal ke cloud saat pengguna login.
4. Buat Dialog Gembok Ramah Anak di komponen World Map saat pemain mengakses level yang belum terbuka, mencegah akses ilegal tanpa menampilkan pesan error yang menakutkan.
5. Buat tes integrasi dan jalankan npm run build untuk memverifikasi keamanan prerender.""")
    add_screenshot_box("Tempel screenshot Antigravity yang memperlihatkan prompt Tahap 4 dan hasil implementasi sinkronisasi progres.")

    add_heading2("12.6 Prompt 05: Audit Kualitas Menyeluruh, Aksesibilitas WCAG, & Deployment Vercel")
    add_p("Tujuan: Melakukan audit menyeluruh terhadap bug, error TypeScript, audit aksesibilitas WCAG 2.1 AA, pengujian E2E Playwright, dan deployment produksi ke Vercel.")
    add_prompt_box("""Lakukan audit kualitas komprehensif, pengujian end-to-end, dan persiapan deployment SpellCode:
1. Lakukan audit kode menyeluruh: perbaiki seluruh type error, lint warning, dan race condition pada eksekusi tombol Run berulang.
2. Pastikan aksesibilitas memenuhi standar WCAG 2.1 AA (kontras rasio warna > 4.5:1, focus-visible ring pada tombol, dan reduced-motion support).
3. Buat dan jalankan automated E2E test menggunakan Playwright yang menguji alur beranda, navigasi peta, arena gameplay, step debugger, dan dialog gembok.
4. Buat panduan deployment docs/DEPLOYMENT_GUIDE.md untuk Vercel dan Supabase.
5. Jalankan verifikasi final: npm run typecheck, npm run lint, npm test, dan npx playwright test. Laporkan seluruh bukti pengujian.""")
    add_screenshot_box("Tempel screenshot Antigravity asli yang memperlihatkan prompt Tahap 5 dan respons hasil audit akhir.")

    add_heading2("12.7 Ringkasan Jurnal Prompt")
    headers_jurnal = ["No", "Prompt / Tahap", "Hasil Verifikasi / Metrik Aktual"]
    rows_jurnal = [
        ["1", "Prompt 01: Arsitektur AST Virtual Machine", "Interpreter deterministik selesai, Web Audio synth aktif, 32 unit test lulus."],
        ["2", "Prompt 02: Antarmuka Meja Mantra & Arena Grid", "Meja mantra, rak blok, dan arena grid 2D selesai, tema Friendly Magic Academy aktif."],
        ["3", "Prompt 03: Kurikulum 18 Level & Par Evaluator", "18 level terdaftar, kalkulator Par 1-3 bintang aktif, Step Debugger berfungsi."],
        ["4", "Prompt 04: Local-First & Supabase Cloud Sync", "Penyimpanan ganda offline-first selesai, dialog gembok ramah anak aktif, auth aman."],
        ["5", "Prompt 05: Audit Menyeluruh & Deployment Vercel", "173 Vitest tes lulus, 13 Playwright E2E tes lulus, 0 lint/type error, live di Vercel."]
    ]
    add_styled_table(headers_jurnal, rows_jurnal, [Inches(0.5), Inches(2.7), Inches(3.07)])

    # -------------------------------------------------------------
    # BAB XIII: LAMPIRAN BUKTI SCREENSHOT
    # -------------------------------------------------------------
    add_heading1("BAB XIII: LAMPIRAN BUKTI SCREENSHOT")
    add_p("Bagian ini menyajikan 15 bukti tangkapan layar komprehensif yang mencakup repositori, dokumen acuan, percakapan AI Agent, antarmuka aplikasi, eksekusi debugger, validasi terminal, hingga website live di Vercel:")

    screenshots_data = [
        ("Bukti 1: Repository Publik GitHub", "Tampilkan repository SpellCode dan bukti bahwa repository dapat diakses publik di GitHub."),
        ("Bukti 2: Dokumen Acuan AI Agent dalam Folder docs/", "Tampilkan daftar file dokumentasi acuan (PRD, ARCHITECTURE, LEVELS, AI_AGENT_WORKFLOW, DEPLOYMENT_GUIDE) dalam repositori atau code editor."),
        ("Bukti 3: Prompt 01 - Fondasi Arsitektur & Virtual Machine", "Tempel screenshot Antigravity yang memperlihatkan eksekusi Prompt 01 dan respons AI Agent."),
        ("Bukti 4: Prompt 02 - Antarmuka Meja Mantra & Arena", "Tempel screenshot Antigravity yang memperlihatkan eksekusi Prompt 02 dan respons AI Agent."),
        ("Bukti 5: Prompt 03 - Kurikulum 18 Level & Par Evaluator", "Tempel screenshot Antigravity yang memperlihatkan eksekusi Prompt 03 dan respons AI Agent."),
        ("Bukti 6: Prompt 04 - Local-First & Supabase Cloud Sync", "Tempel screenshot Antigravity yang memperlihatkan eksekusi Prompt 04 dan respons AI Agent."),
        ("Bukti 7: Prompt 05 - Audit Kualitas & Deployment", "Tempel screenshot Antigravity yang memperlihatkan eksekusi Prompt 05 dan respons AI Agent."),
        ("Bukti 8: Halaman Utama SpellCode (Hero Section)", "Tempel screenshot halaman utama yang menampilkan identitas SpellCode, statistik kurikulum, dan tombol Mulai Petualangan."),
        ("Bukti 9: Peta Petualangan (World Map 3 Dunia)", "Tempel screenshot halaman World Map yang menampilkan Dunia 1, Dunia 2, Dunia 3, serta status bintang dan gembok level."),
        ("Bukti 10: Dialog Gembok Ramah Anak", "Tempel screenshot dialog ramah anak saat pemain mengklik level yang masih terkunci."),
        ("Bukti 11: Arena Tantangan & Meja Mantra", "Tempel screenshot arena permainan yang memperlihatkan grid 2D, Meja Mantra, dan rak balok instruksi."),
        ("Bukti 12: Step Debugger Langkah demi Langkah", "Tempel screenshot eksekusi Step Debugger dengan penyorotan baris balok aktif dan pergerakan avatar pada grid."),
        ("Bukti 13: Modal Kemenangan & Bintang Par", "Tempel screenshot modal kemenangan yang menampilkan perolehan bintang 1-3 berdasarkan efisiensi Par balok."),
        ("Bukti 14: Hasil Pengujian Otomatis Terminal (Vitest & Playwright)", "Tempel screenshot terminal yang memperlihatkan hasil 173 Vitest tes passed dan 13 Playwright E2E tes passed."),
        ("Bukti 15: Website Aktif di URL Deployment Vercel", "Tempel screenshot peramban yang menampilkan website SpellCode dibuka langsung melalui URL Vercel resmi https://spell-code-nine.vercel.app/.")
    ]

    for title, desc in screenshots_data:
        add_heading2(title)
        add_screenshot_box(desc)

    # -------------------------------------------------------------
    # BAB XIV: INFORMASI REPOSITORY DAN DEPLOYMENT
    # -------------------------------------------------------------
    add_heading1("BAB XIV: INFORMASI REPOSITORY DAN DEPLOYMENT")

    add_heading2("14.1 Repository")
    add_p("Tautan resmi repository GitHub:")
    add_p("https://github.com/FirmanDN0/SpellCode", bold_prefix="URL Repository: ", align=WD_ALIGN_PARAGRAPH.LEFT)
    add_p("Repository berstatus publik dan mencakup seluruh source code Next.js 15, test suite Vitest dan Playwright, konfigurasi database Supabase, serta berkas dokumentasi acuan.")

    add_heading2("14.2 Deployment")
    add_p("Tautan resmi deployment website produksi:")
    add_p("https://spell-code-nine.vercel.app/", bold_prefix="URL Deployment Vercel: ", align=WD_ALIGN_PARAGRAPH.LEFT)
    add_p("Website telah diuji secara online, memiliki sertifikat SSL/HTTPS aktif, terintegrasi ke Supabase Cloud, dan dapat diakses publik dengan waktu muat instan.")

    add_heading2("14.3 Catatan Teknis")
    add_bullet("Aplikasi sepenuhnya dapat dimainkan oleh pengguna guest tanpa perlu login berkat arsitektur Local-First.", "Mode Tamu (Guest Mode): ")
    add_bullet("Saat pengguna masuk melalui email/password, sistem otomatis menyinkronkan progres lokal ke akun cloud Supabase tanpa menghapus data.", "Sinkronisasi Cloud: ")
    add_bullet("Seluruh logika eksekusi kode berjalan 100% pada peramban klien tanpa dependensi server runtime, menjamin privasi dan latensi nol.", "Simulasi Klien: ")

    # -------------------------------------------------------------
    # BAB XV: PENUTUP
    # -------------------------------------------------------------
    add_heading1("BAB XV: PENUTUP")
    add_p("SpellCode dibangun sebagai solusi nyata dalam mendekatkan generasi muda kepada dunia logika komputasional dan pemrograman komputer. Melalui pendekatan gamifikasi petualangan murid akademi sihir, SpellCode menghapus momok kesalahan sintaksis yang menakutkan dan menggantikannya dengan rasa ingin tahu, eksperimentasi aktif, serta kepuasan memecahkan masalah.")
    add_p("Dokumentasi ini merangkum seluruh fondasi produk, pilihan teknologi, kurikulum 18 level, arsitektur teknis, jurnal prompt AI Agent, dan bukti pengujian komprehensif. Diharapkan SpellCode dapat memberikan dampak edukatif yang luas, menginspirasi anak-anak Indonesia untuk menjadi pencipta teknologi masa depan, serta memenuhi seluruh kriteria penilaian lomba dengan keunggulan maksimal.")
    add_p("Akhir kata, terima kasih kepada dewan juri, panitia penyelenggara lomba, dan seluruh pihak yang telah mendukung terwujudnya platform edukasi SpellCode.")

    output_path = "SpellCode_Laporan_Dokumentasi.docx"
    doc.save(output_path)
    print(f"File successfully created: {output_path}")

if __name__ == "__main__":
    create_spellcode_doc()
