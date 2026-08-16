import { updateMaterial } from "./lib/db";

async function run() {
  console.log("Atualizando fileUrl do material de teste...");
  const res = await updateMaterial(1, {
    fileUrl: "/materiais/everyday-vocabulary-b1.pdf",
  });
  console.log("Material atualizado com sucesso:", res);
  process.exit(0);
}

run().catch((err) => {
  console.error("Erro ao atualizar material:", err);
  process.exit(1);
});
