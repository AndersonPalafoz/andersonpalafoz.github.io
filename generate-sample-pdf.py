from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def generate_pdf(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Cabeçalho Institucional
    c.setFillColorRGB(0.839, 0.156, 0.156) # Vermelho Institucional #D62828
    c.rect(0, height - 80, width, 80, stroke=0, fill=1)
    
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(54, height - 45, "Anderson Palafoz — Platform")
    c.setFont("Helvetica", 12)
    c.drawString(54, height - 65, "Material Didático Oficial | Nível B1")
    
    # Conteúdo
    c.setFillColorRGB(0.12, 0.12, 0.12)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(54, height - 130, "Everyday Vocabulary & Phrasal Verbs")
    
    c.setFont("Helvetica", 11)
    text_y = height - 160
    lines = [
        "Bem-vindo(a) ao material de estudo autoral desenvolvido pelo Professor Anderson Palafoz.",
        "Este guia prático aborda expressões essenciais do cotidiano e phrasal verbs de nível intermediário (B1).",
        "",
        "1. Expressões de Rotina Diária (Daily Routines)",
        "   - To catch up: Atualizar conversas / colocar o papo em dia.",
        "   - To get through: Superar um desafio ou concluir uma tarefa.",
        "   - To look forward to: Estar ansioso por algo positivo.",
        "",
        "2. Atividade Prática de Fixação",
        "   Complete as frases utilizando o phrasal verb adequado ao contexto acadêmico e profissional.",
        "",
        "Desenvolvido com rigor acadêmico e foco em competência comunicativa.",
        "Site oficial: https://andersonpalafoz.com.br"
    ]
    
    for line in lines:
        if line.startswith("1.") or line.startswith("2."):
            c.setFont("Helvetica-Bold", 12)
        elif line.startswith("   -"):
            c.setFont("Helvetica", 10)
        else:
            c.setFont("Helvetica", 11)
        c.drawString(54, text_y, line)
        text_y -= 22
        
    c.save()
    print(f"PDF gerado com sucesso em {filename}")

if __name__ == "__main__":
    os.makedirs("public/materiais", exist_ok=True)
    generate_pdf("public/materiais/everyday-vocabulary-b1.pdf")
