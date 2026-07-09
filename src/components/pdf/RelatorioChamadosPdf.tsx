import fs from "fs";
import path from "path";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { Chamado, Cliente, User } from "@/generated/prisma/client";
import { STATUS_CHAMADO_LABEL, PRIORIDADE_LABEL, formatDate } from "@/lib/labels";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: "1 solid #e2e8f0",
  },
  logo: { width: 130 },
  titleBlock: { alignItems: "flex-end" },
  title: { fontSize: 15, fontWeight: 700 },
  subtitle: { fontSize: 8.5, color: "#64748b", marginTop: 2 },
  resumo: { flexDirection: "row", marginBottom: 14 },
  statBox: {
    flex: 1,
    marginRight: 10,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 15,
    fontWeight: 700,
    marginTop: 3,
    color: "#0f172a",
  },
  table: { borderTop: "1 solid #e2e8f0" },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  th: {
    fontSize: 7,
    fontWeight: 700,
    color: "#0f172a",
    textTransform: "uppercase",
  },
  td: { fontSize: 8 },
  colNumero: { width: 26 },
  colTitulo: { flex: 2.2, paddingRight: 6 },
  colCliente: { flex: 1.6, paddingRight: 6 },
  colAtendente: { flex: 1.4, paddingRight: 6 },
  colPrioridade: { width: 55 },
  colStatus: { width: 100 },
  colData: { width: 78 },
  vazio: {
    padding: 24,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
    fontSize: 7.5,
    color: "#94a3b8",
    textAlign: "center",
  },
});

const logoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));

type ChamadoCompleto = Chamado & {
  cliente: Cliente;
  atendente: User | null;
};

export function RelatorioChamadosPdf({
  chamados,
  clienteFiltro,
}: {
  chamados: ChamadoCompleto[];
  clienteFiltro?: string | null;
}) {
  const contagemPorStatus = Object.entries(STATUS_CHAMADO_LABEL).map(
    ([status, l]) => ({
      label: l,
      total: chamados.filter((c) => c.status === status).length,
    })
  );

  return (
    <Document title="Relatório de Chamados">
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={logoBuffer} />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Relatório de Chamados</Text>
            {clienteFiltro && (
              <Text style={styles.subtitle}>Cliente: {clienteFiltro}</Text>
            )}
            <Text style={styles.subtitle}>
              Emitido em {formatDate(new Date())}
            </Text>
          </View>
        </View>

        <View style={styles.resumo}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total de chamados</Text>
            <Text style={styles.statValue}>{chamados.length}</Text>
          </View>
          {contagemPorStatus.map(({ label, total }) => (
            <View key={label} style={styles.statBox}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{total}</Text>
            </View>
          ))}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, styles.colNumero]}>#</Text>
            <Text style={[styles.th, styles.colTitulo]}>Título</Text>
            <Text style={[styles.th, styles.colCliente]}>Cliente</Text>
            <Text style={[styles.th, styles.colAtendente]}>Atendente</Text>
            <Text style={[styles.th, styles.colPrioridade]}>Prioridade</Text>
            <Text style={[styles.th, styles.colStatus]}>Status</Text>
            <Text style={[styles.th, styles.colData]}>Aberto em</Text>
            <Text style={[styles.th, styles.colData]}>Fechado em</Text>
          </View>
          {chamados.map((c) => (
            <View key={c.id} style={styles.tableRow} wrap={false}>
              <Text style={[styles.td, styles.colNumero]}>{c.numero}</Text>
              <Text style={[styles.td, styles.colTitulo]}>{c.titulo}</Text>
              <Text style={[styles.td, styles.colCliente]}>
                {c.cliente.nome}
              </Text>
              <Text style={[styles.td, styles.colAtendente]}>
                {c.atendente?.nome ?? "—"}
              </Text>
              <Text style={[styles.td, styles.colPrioridade]}>
                {PRIORIDADE_LABEL[c.prioridade]}
              </Text>
              <Text style={[styles.td, styles.colStatus]}>
                {STATUS_CHAMADO_LABEL[c.status]}
              </Text>
              <Text style={[styles.td, styles.colData]}>
                {formatDate(c.createdAt)}
              </Text>
              <Text style={[styles.td, styles.colData]}>
                {formatDate(c.fechadoEm)}
              </Text>
            </View>
          ))}
        </View>
        {chamados.length === 0 && (
          <Text style={styles.vazio}>Nenhum chamado encontrado.</Text>
        )}

        <Text style={styles.footer} fixed>
          JD Segurança e Tecnologia · Documento gerado automaticamente pelo
          sistema de controle de chamados e ordens de serviço
        </Text>
      </Page>
    </Document>
  );
}
