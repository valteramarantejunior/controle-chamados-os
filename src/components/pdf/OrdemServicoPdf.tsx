import fs from "fs";
import path from "path";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type {
  Cliente,
  OrdemServico,
  ItemOrdemServico,
  User,
  Chamado,
} from "@/generated/prisma/client";
import { STATUS_OS_LABEL, formatDate, formatCurrency } from "@/lib/labels";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "1 solid #e2e8f0",
  },
  logo: { width: 150 },
  titleBlock: { alignItems: "flex-end" },
  title: { fontSize: 16, fontWeight: 700 },
  subtitle: { fontSize: 9, color: "#64748b", marginTop: 2 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6,
    color: "#0f172a",
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 110, color: "#64748b" },
  value: { flex: 1 },
  table: { borderTop: "1 solid #e2e8f0", marginTop: 6 },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e2e8f0",
    paddingVertical: 5,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 5,
    backgroundColor: "#f1f5f9",
  },
  colDescricao: { flex: 3 },
  colQtd: { flex: 1, textAlign: "right" },
  colValor: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingTop: 6,
    borderTop: "1 solid #0f172a",
  },
  observacoes: {
    marginTop: 4,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  fotosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  fotoItem: {
    width: 120,
    height: 120,
    objectFit: "cover",
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  assinaturas: {
    flexDirection: "row",
    marginTop: 24,
  },
  assinaturaBox: {
    flex: 1,
    alignItems: "center",
    marginRight: 16,
  },
  assinaturaImg: {
    width: "100%",
    height: 70,
    objectFit: "contain",
  },
  assinaturaLinha: {
    width: "100%",
    borderTop: "1 solid #94a3b8",
    marginTop: 4,
    paddingTop: 4,
    textAlign: "center",
    fontSize: 9,
    color: "#64748b",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
  },
});

type OrdemServicoCompleta = OrdemServico & {
  cliente: Cliente;
  tecnico: User | null;
  chamado: Chamado | null;
  itens: ItemOrdemServico[];
};

const logoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));

export function OrdemServicoPdf({
  os,
  fotos = [],
}: {
  os: OrdemServicoCompleta;
  fotos?: Buffer[];
}) {
  const totalItens = os.itens.reduce(
    (soma, item) => soma + Number(item.valorUnitario) * item.quantidade,
    0
  );

  return (
    <Document title={`Ordem de Serviço #${os.numero}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={logoBuffer} />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Ordem de Serviço #{os.numero}</Text>
            <Text style={styles.subtitle}>
              Status: {STATUS_OS_LABEL[os.status]}
            </Text>
            <Text style={styles.subtitle}>
              Emitida em {formatDate(new Date())}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>{os.cliente.nome}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.value}>{os.cliente.telefone ?? "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Endereço</Text>
            <Text style={styles.value}>{os.cliente.endereco ?? "—"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviço</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Descrição</Text>
            <Text style={styles.value}>{os.descricao}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Técnico responsável</Text>
            <Text style={styles.value}>{os.tecnico?.nome ?? "Não definido"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data agendada</Text>
            <Text style={styles.value}>{formatDate(os.dataAgendada)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data de conclusão</Text>
            <Text style={styles.value}>{formatDate(os.dataConclusao)}</Text>
          </View>
          {os.chamado && (
            <View style={styles.row}>
              <Text style={styles.label}>Chamado vinculado</Text>
              <Text style={styles.value}>#{os.chamado.numero}</Text>
            </View>
          )}
        </View>

        {os.itens.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Itens e peças utilizadas</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.colDescricao}>Descrição</Text>
                <Text style={styles.colQtd}>Qtd.</Text>
                <Text style={styles.colValor}>Valor unit.</Text>
                <Text style={styles.colTotal}>Total</Text>
              </View>
              {os.itens.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={styles.colDescricao}>{item.descricao}</Text>
                  <Text style={styles.colQtd}>{item.quantidade}</Text>
                  <Text style={styles.colValor}>
                    {formatCurrency(item.valorUnitario as unknown as string)}
                  </Text>
                  <Text style={styles.colTotal}>
                    {formatCurrency(
                      Number(item.valorUnitario) * item.quantidade
                    )}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={{ fontWeight: 700 }}>
            Valor total: {formatCurrency(totalItens)}
          </Text>
        </View>

        {os.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <View style={styles.observacoes}>
              <Text>{os.observacoes}</Text>
            </View>
          </View>
        )}

        {fotos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos do serviço</Text>
            <View style={styles.fotosGrid}>
              {fotos.map((foto, i) => (
                <Image key={i} style={styles.fotoItem} src={foto} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.assinaturas}>
          <View style={styles.assinaturaBox}>
            {os.assinaturaTecnico && (
              <Image style={styles.assinaturaImg} src={os.assinaturaTecnico} />
            )}
            <Text style={styles.assinaturaLinha}>Assinatura do técnico</Text>
          </View>
          <View style={styles.assinaturaBox}>
            {os.assinaturaCliente && (
              <Image style={styles.assinaturaImg} src={os.assinaturaCliente} />
            )}
            <Text style={styles.assinaturaLinha}>Assinatura do cliente</Text>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          JD Segurança e Tecnologia · Documento gerado automaticamente pelo
          sistema de controle de chamados e ordens de serviço
        </Text>
      </Page>
    </Document>
  );
}
