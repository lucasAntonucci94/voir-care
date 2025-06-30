import { defineStore } from 'pinia';
import { useReports } from '../composable/useReports';

export const useReportsStore = defineStore('reports', {
  state: () => ({
    reportsCount: null, // Almacena el conteo de reportes
    reports: [], // Almacena la lista de reportes
    unsubscribe: null, // Almacena la función de desuscripción
  }),

  actions: {
    /**
     * Guarda un reporte para cualquier tipo de entidad utilizando el composable useReports.
     * @param {Object} params - Parámetros del reporte
     * @returns {Promise<string>} - ID del reporte creado
     */
    async saveReport(params) {
      const { saveReport } = useReports();
      try {
        const reportId = await saveReport(params);
        return reportId;
      } catch (error) {
        console.error('Error en el store al guardar el reporte:', error);
        throw error;
      }
    },

    /**
     * Obtiene la cantidad total de reportes y actualiza el estado reportsCount.
     * @returns {Promise<number>} - Cantidad de reportes
     */
    async getCount() {
      const { getReportsCount } = useReports();
      try {
        const count = await getReportsCount();
        this.reportsCount = count;
        return count;
      } catch (error) {
        console.error('Error en el store al obtener el conteo de reportes:', error);
        throw error;
      }
    },

    /**
     * Elimina un reporte por su ID de documento.
     * @param {string} docId - ID del documento del reporte
     * @returns {Promise<void>}
     */
    async deleteReport(docId) {
      const { deleteReport } = useReports();
      try {
        await deleteReport(docId);
        // Actualizar la lista de reportes en el estado si está cargada
        this.reports = this.reports.filter((report) => report.id !== docId);
        // Actualizar el conteo
        await this.getCount();
      } catch (error) {
        console.error('Error en el store al eliminar el reporte:', error);
        throw error;
      }
    },

    /**
     * Obtiene un reporte por su ID de documento.
     * @param {string} docId - ID del documento del reporte
     * @returns {Promise<Object|null>} - Datos del reporte
     */
    async getReportById(docId) {
      const { getReportById } = useReports();
      try {
        const report = await getReportById(docId);
        return report;
      } catch (error) {
        console.error('Error en el store al obtener el reporte por ID:', error);
        throw error;
      }
    },

    /**
     * Obtiene todos los reportes y actualiza el estado reports.
     * @returns {Promise<Array>} - Lista de reportes
     */
    async getAllReports() {
      const { getAllReports } = useReports();
      try {
        const reports = await getAllReports();
        this.reports = reports;
        // Actualizar el conteo
        await this.getCount();
        return reports;
      } catch (error) {
        console.error('Error en el store al obtener todos los reportes:', error);
        throw error;
      }
    },

    /**
     * Suscribe al store para escuchar los reportes en tiempo real.
     * @returns {Promise<void>}
     */
    async subscribeToReports() {
      const { subscribeToReports } = useReports();
      try {
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
        }
        this.unsubscribe = subscribeToReports((reports) => {
          this.reports = reports;
          this.reportsCount = reports.length;
        });
      } catch (error) {
        console.error('Error en el store al suscribirse a reportes:', error);
        throw error;
      }
    },

    /**
     * Cancela la suscripción a los reportes en tiempo real.
     */
    unsubscribeFromReports() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
        this.reports = [];
        this.reportsCount = null;
      }
    },
  },

  getters: {
    /**
     * Retorna el conteo de reportes almacenado en el estado.
     * @returns {number|null}
     */
    getReportsCount: (state) => state.reportsCount,

    /**
     * Retorna la lista de reportes almacenada en el estado.
     * @returns {Array}
     */
    getReports: (state) => state.reports,
  },
});