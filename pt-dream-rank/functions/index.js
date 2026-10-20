const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
initializeApp();
const db = getFirestore();
const API = "https://api.tibiadata.com/v4";
const norm = s => String(s || "").trim().toLowerCase();
async function getJson(path) {
  const r = await fetch(API + path, {headers: {"user-agent":"PT-Dream-Rank/1.0"}});
  if (!r.ok) throw new Error("TibiaData HTTP " + r.status);
  const j = await r.json();
  if (j?.information?.status?.type === "error") throw new Error(j.information.status.error || "TibiaData error");
  return j;
}
function characterData(j) {
  return j?.character?.character || j?.characters?.data?.character || j?.data?.character || null;
}
exports.refreshCharacters = onSchedule({
  schedule: "every 6 hours", timeZone: "America/Sao_Paulo",
  region: "southamerica-east1", timeoutSeconds: 540, memory: "512MiB"
}, async () => {
  const users = await db.collection("users").get();
  let updated = 0, errors = 0;
  for (const user of users.docs) {
    const chars = await user.ref.collection("characters").where("active", "==", true).get();
    for (const doc of chars.docs) {
      const c = doc.data();
      try {
        const j = await getJson("/character/" + encodeURIComponent(c.name));
        const raw = characterData(j);
        if (!raw) throw new Error("Resposta da API sem dados de personagem");
        const experience = Number(String(raw.experience || "0").replace(/[^0-9]/g, "")) || 0;
        const snapshot = {
          name: c.name, world: raw.world || c.world || "",
          vocation: raw.vocation || "", level: Number(raw.level) || 0,
          experience, fetchedAt: Timestamp.now(), source: "tibiadata-v4"
        };
        await doc.ref.set({
          world: snapshot.world, vocation: snapshot.vocation,
          level: snapshot.level, experience,
          lastUpdatedAt: FieldValue.serverTimestamp(),
          lastError: FieldValue.delete()
        }, {merge:true});
        await doc.ref.collection("snapshots").add(snapshot);
        updated++;
      } catch (e) {
        errors++;
        await doc.ref.set({lastError:String(e.message || e), lastAttemptAt:FieldValue.serverTimestamp()},{merge:true});
      }
      await new Promise(r => setTimeout(r, 300));
    }
  }
  await db.collection("system").doc("refreshStatus").set({
    lastRunAt:FieldValue.serverTimestamp(), updated, errors
  },{merge:true});
});
