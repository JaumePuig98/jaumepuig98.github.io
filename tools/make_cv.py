"""Regenerate assets/Jaume-Puig-CV.pdf from experience.html.

Usage: python3 tools/make_cv.py experience.html assets/Jaume-Puig-CV.pdf
Needs: pip install reportlab beautifulsoup4, plus Inter TTFs (set INTER_400 / INTER_600,
e.g. converted from the @fontsource/inter .woff files with fontTools).
Keep the result at 2 pages.
"""
import os,sys,re
from bs4 import BeautifulSoup
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
pdfmetrics.registerFont(TTFont('Inter',os.environ.get('INTER_400','/tmp/inter-400.ttf'))); pdfmetrics.registerFont(TTFont('Inter-Bold',os.environ.get('INTER_600','/tmp/inter-600.ttf')))
pdfmetrics.registerFontFamily('Inter',normal='Inter',bold='Inter-Bold',italic='Inter',boldItalic='Inter-Bold')
src,out=sys.argv[1],sys.argv[2]
s=BeautifulSoup(open(src,encoding='utf-8').read(),'html.parser')
INK=HexColor('#111827'); MUT=HexColor('#4b5563'); ACC=HexColor('#0e7490')
st=lambda n,**k: ParagraphStyle(n,fontName=k.pop('f','Inter'),textColor=k.pop('c',INK),**k)
name=st('n',f='Inter-Bold',fontSize=24,leading=28); sub=st('s',fontSize=11,leading=15,c=ACC); con=st('c',fontSize=9,leading=13,c=MUT)
h=st('h',f='Inter-Bold',fontSize=10.5,leading=14,c=ACC,spaceBefore=8,spaceAfter=2,keepWithNext=1)
dt=st('d',fontSize=8,leading=11,c=MUT); ttl=st('t',f='Inter-Bold',fontSize=9.4,leading=12); org=st('o',fontSize=8.8,leading=11.5,c=MUT)
bl=st('b',fontSize=8.9,leading=11.6,leftIndent=10,bulletIndent=0,spaceBefore=1.5)
def tx(e):
    for a in e.find_all('svg'): a.decompose()
    t=''
    for c in e.children:
        if getattr(c,'name',None) in ('strong','b'): t+='<b>%s</b>'%c.get_text()
        elif getattr(c,'name',None): t+=c.get_text().replace('&','&amp;')
        else: t+=str(c).replace('&','&amp;').replace('<','&lt;')
    return re.sub(r'\s+',' ',t).strip()
E=[Paragraph('Jaume Puig',name),Paragraph('Space Radiobiologist and Engineer',sub),Spacer(1,3),
   Paragraph('jaume.puig98@gmail.com &nbsp;|&nbsp; jaumepuig98.github.io &nbsp;|&nbsp; linkedin.com/in/jaume-puig',con),
   Paragraph('ORCID 0000-0002-3642-4919',con),Spacer(1,6),HRFlowable(width='100%',thickness=0.5,color=HexColor('#d1d5db'))]
def entries(sec):
    for e in sec.select('.cv-entry'):
        left=[Paragraph(tx(e.select_one('.cv-entry-title')),ttl),Paragraph(tx(e.select_one('.cv-entry-org')),org)]
        for li in e.select('.cv-entry-desc li'): left.append(Paragraph(tx(li),bl,bulletText='•'))
        t=Table([[Paragraph(tx(e.select_one('.cv-entry-date')),dt),left]],colWidths=[1.25*inch,5.75*inch])
        t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),4.5),('TOPPADDING',(0,0),(-1,-1),0)]))
        E.append(KeepTogether(t))
def cards(sec):
    igem=[]
    for e in sec.select('.cv-card'):
        if 'cv-card--award' in e.get('class',[]):
            left=[Paragraph('<b>%s</b> &nbsp;<font name="Inter" color="#4b5563">%s</font>'%(tx(e.select_one('.cv-card-title')),tx(e.select_one('.cv-card-meta'))),ttl)]
        else:
            left=[Paragraph(tx(e.select_one('.cv-card-title')),ttl),Paragraph(tx(e.select_one('.cv-card-meta')),org)]
        t=Table([[Paragraph(tx(e.select_one('.cv-card-when')),dt),left]],colWidths=[1.25*inch,5.75*inch])
        t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),3.5),('TOPPADDING',(0,0),(-1,-1),0)]))
        E.append(KeepTogether(t))
    if False:
        txt='<b>iGEM 2020, Team UPF_Barcelona</b> &nbsp;<font name="Inter" color="#4b5563">%s; nominated for %s.</font>'%(', '.join(igem[:3]).replace('iGEM Gold Medal','Gold Medal'),igem[3])
        t=Table([[Paragraph('2020',dt),[Paragraph(txt,ttl)]]],colWidths=[1.25*inch,5.75*inch])
        t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),3.5),('TOPPADDING',(0,0),(-1,-1),0)]))
        E.append(KeepTogether(t))
for sid,label,fn in (('experience','PROFESSIONAL EXPERIENCE',entries),('education','ACADEMIC BACKGROUND',entries),('publications','PUBLICATIONS',cards),('presentations','PRESENTATIONS',cards),('awards','AWARDS & HONORS',cards)):
    sec=s.find('section',id=sid); E.append(Paragraph(label.replace('&','&amp;'),h)); fn(sec)
doc=SimpleDocTemplate(out,pagesize=LETTER,leftMargin=0.65*inch,rightMargin=0.65*inch,topMargin=0.4*inch,bottomMargin=0.4*inch,title='Jaume Puig: CV',author='Jaume Puig')
doc.build(E)
