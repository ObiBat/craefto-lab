"""Generate Craefto Company Profile PDF — 10 slides, landscape A4"""
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

OUTPUT = "/Users/craefto/Developer/craefto-lab/public/craefto-company-profile.pdf"

# Colors
BLACK = HexColor("#0A0A0A")
DARK = HexColor("#111111")
GRAY = HexColor("#6B7280")
LIGHT_GRAY = HexColor("#F3F4F6")
WHITE = HexColor("#FFFFFF")
ACCENT = HexColor("#FF6B6B")
MUTED = HexColor("#9CA3AF")
BG_MUTED = HexColor("#F9FAFB")

W, H = landscape(A4)
M = 30 * mm  # margin


def draw_footer(c, page_num, total=10):
    c.setFont("Helvetica", 7)
    c.setFillColor(MUTED)
    c.drawString(M, 12 * mm, "Craefto  |  craefto.com  |  hello@craefto.com")
    c.drawRightString(W - M, 12 * mm, f"{page_num} / {total}")


def slide_cover(c):
    """Slide 1: Cover"""
    c.setFillColor(BLACK)
    c.rect(0, 0, W, H, fill=True, stroke=False)

    # Logo text
    c.setFont("Helvetica-Bold", 48)
    c.setFillColor(WHITE)
    c.drawString(M, H - 60 * mm, "Craefto")

    # Tagline
    c.setFont("Helvetica", 14)
    c.setFillColor(HexColor("#999999"))
    c.drawString(M, H - 72 * mm, "Creative Tech Studio")

    # Descriptor
    c.setFont("Helvetica", 11)
    c.setFillColor(HexColor("#666666"))
    y = H / 2 + 10 * mm
    lines = [
        "Design systems and digital products",
        "built with craft and intention.",
    ]
    for line in lines:
        c.drawString(M, y, line)
        y -= 6 * mm

    # Accent line
    c.setStrokeColor(ACCENT)
    c.setLineWidth(3)
    c.line(M, 30 * mm, M + 40 * mm, 30 * mm)

    # Contact
    c.setFont("Helvetica", 9)
    c.setFillColor(HexColor("#666666"))
    c.drawString(M, 22 * mm, "Sydney, Australia  |  hello@craefto.com  |  craefto.com")

    c.showPage()


def slide_about(c):
    """Slide 2: Who We Are"""
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=True, stroke=False)

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(ACCENT)
    c.drawString(M, H - 25 * mm, "01  WHO WE ARE")

    c.setFont("Helvetica-Bold", 28)
    c.setFillColor(BLACK)
    c.drawString(M, H - 42 * mm, "Small team. Big craft.")

    c.setFont("Helvetica", 11)
    c.setFillColor(GRAY)
    y = H - 58 * mm
    about_lines = [
        "Craefto is a creative tech studio based in Sydney, Australia.",
        "Founded by Obi Batbileg, a design technologist who builds at the",
        "intersection of design, engineering, and systems thinking.",
        "",
        "We handle strategy, design, and development as one continuous",
        "process. One team, one conversation, start to finish.",
        "",
        "No handoffs. No lost context. No template work.",
        "Every project is approached from first principles.",
    ]
    for line in about_lines:
        if line:
            c.drawString(M, y, line)
        y -= 5.5 * mm

    # Right side: key facts
    x_right = W / 2 + 20 * mm
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(BLACK)
    facts = [
        ("Founded", "2024"),
        ("Based in", "Sydney, Australia"),
        ("ABN", "81 278 859 855"),
        ("Founder", "Obi Batbileg"),
        ("Contact", "hello@craefto.com"),
        ("Web", "craefto.com"),
    ]
    y = H - 58 * mm
    for label, value in facts:
        c.setFont("Helvetica", 9)
        c.setFillColor(MUTED)
        c.drawString(x_right, y, label)
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(BLACK)
        c.drawString(x_right + 35 * mm, y, value)
        y -= 8 * mm

    draw_footer(c, 2)
    c.showPage()


def slide_services(c):
    """Slide 3: Services Overview"""
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=True, stroke=False)

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(ACCENT)
    c.drawString(M, H - 25 * mm, "02  SERVICES")

    c.setFont("Helvetica-Bold", 28)
    c.setFillColor(BLACK)
    c.drawString(M, H - 42 * mm, "What we build")

    services = [
        ("01", "Web Design & Development", "Marketing sites, SaaS platforms, dashboards. React, Next.js, full stack."),
        ("02", "Brand Identity", "Strategy, logo systems, design tokens, brand guidelines."),
        ("03", "Digital Products", "MVPs, portals, interactive experiences, WebGL, API integrations."),
        ("04", "AI & Automation", "Custom agents, LLM integrations, workflow automation."),
        ("05", "Security & Pen Testing", "Web app security, vulnerability assessments, compliance readiness."),
    ]

    y = H - 62 * mm
    for num, title, desc in services:
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(ACCENT)
        c.drawString(M, y, num)
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(BLACK)
        c.drawString(M + 12 * mm, y, title)
        c.setFont("Helvetica", 9)
        c.setFillColor(GRAY)
        c.drawString(M + 12 * mm, y - 5.5 * mm, desc)
        y -= 17 * mm

    draw_footer(c, 3)
    c.showPage()


def slide_approach(c):
    """Slide 4: Our Approach"""
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=True, stroke=False)

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(ACCENT)
    c.drawString(M, H - 25 * mm, "03  OUR APPROACH")

    c.setFont("Helvetica-Bold", 28)
    c.setFillColor(BLACK)
    c.drawString(M, H - 42 * mm, "How we work")

    phases = [
        ("01", "Understand", "Discovery call, market research,\ngoal definition, strategy document.", "Week 1 to 2"),
        ("02", "Design", "Information architecture, wireframes,\nvisual design, client review.", "Week 2 to 4"),
        ("03", "Build", "Frontend + backend development,\nintegrations, QA, staging review.", "Week 4 to 8"),
        ("04", "Launch & Grow", "Deployment, analytics setup,\n30 day support, ongoing optimization.", "Week 8+"),
    ]

    x = M
    box_w = (W - 2 * M - 15 * mm) / 4
    y_top = H - 60 * mm

    for num, title, desc, timeline in phases:
        # Box
        c.setFillColor(BG_MUTED)
        c.roundRect(x, y_top - 55 * mm, box_w, 55 * mm, 3, fill=True, stroke=False)

        # Number
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(ACCENT)
        c.drawString(x + 5 * mm, y_top - 8 * mm, num)

        # Title
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(BLACK)
        c.drawString(x + 5 * mm, y_top - 16 * mm, title)

        # Description
        c.setFont("Helvetica", 8.5)
        c.setFillColor(GRAY)
        dy = y_top - 25 * mm
        for line in desc.split("\n"):
            c.drawString(x + 5 * mm, dy, line)
            dy -= 4.5 * mm

        # Timeline
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(MUTED)
        c.drawString(x + 5 * mm, y_top - 48 * mm, timeline)

        x += box_w + 5 * mm

    draw_footer(c, 4)
    c.showPage()


def slide_case_study(c, page_num, num, name, scope, result):
    """Generic case study slide"""
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=True, stroke=False)

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(ACCENT)
    c.drawString(M, H - 25 * mm, f"04  CASE STUDY {num}")

    c.setFont("Helvetica-Bold", 28)
    c.setFillColor(BLACK)
    c.drawString(M, H - 42 * mm, name)

    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(MUTED)
    c.drawString(M, H - 55 * mm, "SCOPE")

    c.setFont("Helvetica", 11)
    c.setFillColor(GRAY)
    y = H - 63 * mm
    for line in scope:
        c.drawString(M, y, line)
        y -= 5.5 * mm

    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(MUTED)
    c.drawString(M, y - 5 * mm, "RESULT")

    c.setFont("Helvetica", 11)
    c.setFillColor(GRAY)
    y = y - 13 * mm
    for line in result:
        c.drawString(M, y, line)
        y -= 5.5 * mm

    # View link
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(ACCENT)
    c.drawString(M, 30 * mm, f"craefto.com/work/{name.lower().replace(' ', '-')}")

    draw_footer(c, page_num)
    c.showPage()


def slide_tech_stack(c):
    """Slide 7: Tech Stack"""
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=True, stroke=False)

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(ACCENT)
    c.drawString(M, H - 25 * mm, "05  TECHNOLOGY")

    c.setFont("Helvetica-Bold", 28)
    c.setFillColor(BLACK)
    c.drawString(M, H - 42 * mm, "Our stack")

    categories = [
        ("Frontend", ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js / WebGL"]),
        ("Backend", ["Node.js", "Python", "Supabase", "PostgreSQL", "Prisma", "REST / GraphQL APIs"]),
        ("AI & Automation", ["Claude / GPT / Gemini", "LangChain", "Custom agents", "OpenClaw", "Workflow automation"]),
        ("Infrastructure", ["Vercel", "AWS", "Docker", "GitHub Actions", "CI/CD pipelines"]),
    ]

    x = M
    col_w = (W - 2 * M - 15 * mm) / 4
    y_top = H - 60 * mm

    for cat_name, items in categories:
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(BLACK)
        c.drawString(x, y_top, cat_name)

        c.setFont("Helvetica", 9)
        c.setFillColor(GRAY)
        y = y_top - 8 * mm
        for item in items:
            c.drawString(x, y, item)
            y -= 5.5 * mm

        x += col_w + 5 * mm

    draw_footer(c, 7)
    c.showPage()


def slide_testimonials(c):
    """Slide 8: What Clients Say (placeholder)"""
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=True, stroke=False)

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(ACCENT)
    c.drawString(M, H - 25 * mm, "06  CLIENTS")

    c.setFont("Helvetica-Bold", 28)
    c.setFillColor(BLACK)
    c.drawString(M, H - 42 * mm, "Who we work with")

    c.setFont("Helvetica", 11)
    c.setFillColor(GRAY)
    y = H - 62 * mm
    lines = [
        "We work with founders, startups, and growing businesses",
        "across a range of industries, from property technology",
        "to education, healthcare, and creative services.",
        "",
        "Our clients come to us because they value quality",
        "over speed, and want a partner who understands",
        "both design and engineering.",
    ]
    for line in lines:
        if line:
            c.drawString(M, y, line)
        y -= 6 * mm

    # Client names
    clients = ["GlobFam", "JAPANoMa (Go&C Partners)", "Fontkin", "NUU Rental"]
    x_right = W / 2 + 20 * mm
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(MUTED)
    c.drawString(x_right, H - 62 * mm, "SELECT CLIENTS")

    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(BLACK)
    y = H - 73 * mm
    for client in clients:
        c.drawString(x_right, y, client)
        y -= 8 * mm

    draw_footer(c, 8)
    c.showPage()


def slide_engagement(c):
    """Slide 9: Engagement Models"""
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=True, stroke=False)

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(ACCENT)
    c.drawString(M, H - 25 * mm, "07  ENGAGEMENT")

    c.setFont("Helvetica-Bold", 28)
    c.setFillColor(BLACK)
    c.drawString(M, H - 42 * mm, "How to work with us")

    models = [
        ("Project Based", "Fixed scope, fixed price. Discovery to launch.\nIdeal for websites, brand identities, and MVPs.", "$3,000 to $30,000+"),
        ("Sprint Retainer", "Ongoing development and design support.\nDedicated hours each month.", "$2,000 to $6,000/mo"),
        ("Advisory", "Strategic guidance on design, tech, and AI.\nPerfect for founders who need a sounding board.", "$150/hr"),
    ]

    x = M
    box_w = (W - 2 * M - 10 * mm) / 3
    y_top = H - 60 * mm

    for title, desc, price in models:
        c.setFillColor(BG_MUTED)
        c.roundRect(x, y_top - 60 * mm, box_w, 60 * mm, 3, fill=True, stroke=False)

        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(BLACK)
        c.drawString(x + 5 * mm, y_top - 10 * mm, title)

        c.setFont("Helvetica", 9)
        c.setFillColor(GRAY)
        dy = y_top - 20 * mm
        for line in desc.split("\n"):
            c.drawString(x + 5 * mm, dy, line)
            dy -= 5 * mm

        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(ACCENT)
        c.drawString(x + 5 * mm, y_top - 53 * mm, price)

        x += box_w + 5 * mm

    draw_footer(c, 9)
    c.showPage()


def slide_contact(c):
    """Slide 10: Contact / Next Steps"""
    c.setFillColor(BLACK)
    c.rect(0, 0, W, H, fill=True, stroke=False)

    c.setFont("Helvetica-Bold", 36)
    c.setFillColor(WHITE)
    c.drawString(M, H - 55 * mm, "Ready to start?")

    c.setFont("Helvetica", 13)
    c.setFillColor(HexColor("#999999"))
    y = H - 72 * mm
    lines = [
        "You don't need a finished brief or a clear direction.",
        "Start with what you are thinking about,",
        "and we will shape it together.",
    ]
    for line in lines:
        c.drawString(M, y, line)
        y -= 7 * mm

    # Contact details
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(WHITE)
    y = H / 2 - 10 * mm
    details = [
        ("Email", "hello@craefto.com"),
        ("Web", "craefto.com"),
        ("LinkedIn", "linkedin.com/company/craefto"),
        ("X", "x.com/craefto"),
    ]
    for label, value in details:
        c.setFont("Helvetica", 9)
        c.setFillColor(HexColor("#666666"))
        c.drawString(M, y, label)
        c.setFont("Helvetica", 11)
        c.setFillColor(WHITE)
        c.drawString(M + 25 * mm, y, value)
        y -= 8 * mm

    # Accent line
    c.setStrokeColor(ACCENT)
    c.setLineWidth(3)
    c.line(M, 30 * mm, M + 40 * mm, 30 * mm)

    c.setFont("Helvetica", 9)
    c.setFillColor(HexColor("#666666"))
    c.drawString(M, 22 * mm, "Craefto  |  Sydney, Australia  |  ABN 81 278 859 855")

    c.showPage()


def main():
    c = canvas.Canvas(OUTPUT, pagesize=landscape(A4))
    c.setTitle("Craefto Company Profile 2026")
    c.setAuthor("Craefto")

    slide_cover(c)
    slide_about(c)
    slide_services(c)
    slide_approach(c)

    # Case studies
    slide_case_study(c, 5, "01", "GlobFam",
        ["Brand identity, web platform, and buyer matching system",
         "for a global property technology startup."],
        ["Complete brand system, responsive web application,",
         "and intelligent buyer insight platform."])

    slide_case_study(c, 6, "02", "Fontkin",
        ["Brand identity and web presence for a",
         "typography and font discovery platform."],
        ["Distinctive visual identity, marketing site,",
         "and font showcase experience."])

    slide_tech_stack(c)
    slide_testimonials(c)
    slide_engagement(c)
    slide_contact(c)

    c.save()
    print(f"Company profile saved to: {OUTPUT}")


if __name__ == "__main__":
    main()
