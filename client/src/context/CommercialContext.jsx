import React, { createContext, useContext, useState } from 'react';
import PricingModal from '../components/Billing/PricingModal';
import ParentReportModal from '../components/Parent/ParentReportModal';
import BulkEnrollModal from '../components/Classroom/BulkEnrollModal';

const CommercialContext = createContext();

export function CommercialProvider({ children }) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [reportStudentId, setReportStudentId] = useState(null);
  const [bulkEnrollConfig, setBulkEnrollConfig] = useState(null); // { classId, classTitle, onEnrollSuccess }

  const openPricing = () => setIsPricingOpen(true);
  const closePricing = () => setIsPricingOpen(false);

  const openReport = (studentId) => setReportStudentId(studentId);
  const closeReport = () => setReportStudentId(null);

  const openBulkEnroll = (classId, classTitle, onEnrollSuccess) => {
    setBulkEnrollConfig({ classId, classTitle, onEnrollSuccess });
  };
  const closeBulkEnroll = () => setBulkEnrollConfig(null);

  return (
    <CommercialContext.Provider
      value={{
        openPricing,
        closePricing,
        isPricingOpen,
        openReport,
        closeReport,
        reportStudentId,
        openBulkEnroll,
        closeBulkEnroll
      }}
    >
      {children}

      {/* Global Commercial Modals */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={closePricing}
      />

      {reportStudentId && (
        <ParentReportModal
          studentId={reportStudentId}
          onClose={closeReport}
        />
      )}

      {bulkEnrollConfig && (
        <BulkEnrollModal
          classId={bulkEnrollConfig.classId}
          classTitle={bulkEnrollConfig.classTitle}
          onEnrollSuccess={bulkEnrollConfig.onEnrollSuccess}
          onClose={closeBulkEnroll}
        />
      )}
    </CommercialContext.Provider>
  );
}

export const useCommercial = () => useContext(CommercialContext);
