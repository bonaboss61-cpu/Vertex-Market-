/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  FileText, 
  UploadCloud, 
  Globe, 
  CheckCircle2, 
  FileCheck, 
  TrendingUp, 
  Award,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Gift,
  Fingerprint,
  ScanFace,
  Key,
  Shield
} from 'lucide-react';
import { UserAccount } from '../types';

interface AuthKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup' | 'kyc';
  account: UserAccount;
  onUpdateAccount: (updated: Partial<UserAccount>) => void;
  onReplaceAccount?: (acc: UserAccount & { password?: string; securityAnswer?: string }) => void;
  onClearHistory?: () => void;
  onTriggerToast?: (type: 'WIN' | 'LOSS' | 'LEVEL_UP' | 'ACHIEVEMENT', title: string, description: string) => void;
  onPlaySound?: (type: 'WIN' | 'LOSS' | 'CLICK' | 'PLACE') => void;
}

interface CountryIdConfig {
  name: string;
  code: string;
  idLabel: string;
  licenseLabel: string;
  placeholder: string;
}

const COUNTRIES_DATABASE: CountryIdConfig[] = [
  { name: 'Afghanistan', code: 'AF', idLabel: 'Tazkira (National ID)', licenseLabel: 'Afghan Driving License', placeholder: 'e.g. Tazkira Serial Number' },
  { name: 'Albania', code: 'AL', idLabel: 'Letërnjoftim (National ID)', licenseLabel: 'Albanian Driving License', placeholder: 'e.g. Personal ID Number' },
  { name: 'Algeria', code: 'DZ', idLabel: 'National ID Card', licenseLabel: 'Permis de Conduire', placeholder: 'e.g. 18-digit ID number' },
  { name: 'Andorra', code: 'AD', idLabel: 'Carta d\'Identitat', licenseLabel: 'Permís de Conduir', placeholder: 'e.g. National ID Number' },
  { name: 'Angola', code: 'AO', idLabel: 'Bilhete de Identidade (BI)', licenseLabel: 'Carta de Condução', placeholder: 'e.g. BI Number' },
  { name: 'Argentina', code: 'AR', idLabel: 'DNI Card', licenseLabel: 'Licencia Nacional de Conducir', placeholder: 'e.g. DNI Number' },
  { name: 'Armenia', code: 'AM', idLabel: 'Identification Card', licenseLabel: 'Armenian Driving License', placeholder: 'e.g. ID Card Number' },
  { name: 'Australia', code: 'AU', idLabel: 'State Photo Card', licenseLabel: 'State Driver\'s Licence', placeholder: 'e.g. Licence Number' },
  { name: 'Austria', code: 'AT', idLabel: 'Personalausweis', licenseLabel: 'Führerschein', placeholder: 'e.g. Austrian ID number' },
  { name: 'Azerbaijan', code: 'AZ', idLabel: 'Şəxsiyyət Vəsiqəsi (ID)', licenseLabel: 'Sürücülük Vəsiqəsi', placeholder: 'e.g. ID Serial Number' },
  { name: 'Bahamas', code: 'BS', idLabel: 'National Insurance Card', licenseLabel: 'Bahamas Driving Licence', placeholder: 'e.g. NIB Number' },
  { name: 'Bahrain', code: 'BH', idLabel: 'CPR (National ID)', licenseLabel: 'Bahraini Driving License', placeholder: 'e.g. 9-digit Personal ID' },
  { name: 'Bangladesh', code: 'BD', idLabel: 'National ID (NID)', licenseLabel: 'Bangladesh Driving License', placeholder: 'e.g. 10 or 17 digit NID' },
  { name: 'Barbados', code: 'BB', idLabel: 'National Registration ID', licenseLabel: 'Barbados Driving Licence', placeholder: 'e.g. 10-digit ID' },
  { name: 'Belarus', code: 'BY', idLabel: 'Identity Card', licenseLabel: 'Driving Licence', placeholder: 'e.g. Passport/ID number' },
  { name: 'Belgium', code: 'BE', idLabel: 'Identiteitskaart / Carte d\'Identité', licenseLabel: 'Rijbewijs / Permis', placeholder: 'e.g. 12-digit Card Number' },
  { name: 'Belize', code: 'BZ', idLabel: 'Social Security Card', licenseLabel: 'Belize Driving License', placeholder: 'e.g. SSN Number' },
  { name: 'Benin', code: 'BJ', idLabel: 'Carte Nationale d\'Identité', licenseLabel: 'Permis de Conduire', placeholder: 'e.g. CNI Card Number' },
  { name: 'Bolivia', code: 'BO', idLabel: 'Cédula de Identidad (CI)', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. CI Number' },
  { name: 'Bosnia and Herzegovina', code: 'BA', idLabel: 'Lična Karta', licenseLabel: 'Vozačka Dozvola', placeholder: 'e.g. 9-digit Card ID' },
  { name: 'Botswana', code: 'BW', idLabel: 'Omang (National ID)', licenseLabel: 'Botswana Driving Licence', placeholder: 'e.g. 9-digit Omang number' },
  { name: 'Brazil', code: 'BR', idLabel: 'CPF / RG Card', licenseLabel: 'CNH Licence', placeholder: 'e.g. XXX.XXX.XXX-XX' },
  { name: 'Brunei', code: 'BN', idLabel: 'Smart Identity Card', licenseLabel: 'Brunei Driving License', placeholder: 'e.g. ID Card Number' },
  { name: 'Bulgaria', code: 'BG', idLabel: 'Lichna Karta', licenseLabel: 'Svidetelstvo za Upravlenie', placeholder: 'e.g. 9-digit Card ID' },
  { name: 'Cambodia', code: 'KH', idLabel: 'Khmer National ID', licenseLabel: 'Cambodian Driving License', placeholder: 'e.g. 9-digit ID number' },
  { name: 'Cameroon', code: 'CM', idLabel: 'Carte Nationale d\'Identité', licenseLabel: 'Permis de Conduire', placeholder: 'e.g. CNI Number' },
  { name: 'Canada', code: 'CA', idLabel: 'Provincial ID Card', licenseLabel: 'Provincial Driver\'s Licence', placeholder: 'e.g. provincial ID number' },
  { name: 'Chile', code: 'CL', idLabel: 'Cédula de Identidad (RUT)', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. XX.XXX.XXX-X' },
  { name: 'China', code: 'CN', idLabel: 'Resident Identity Card', licenseLabel: 'Chinese Driver\'s License', placeholder: 'e.g. 18-digit ID code' },
  { name: 'Colombia', code: 'CO', idLabel: 'Cédula de Ciudadanía', licenseLabel: 'Licencia de Conducción', placeholder: 'e.g. Cédula number' },
  { name: 'Costa Rica', code: 'CR', idLabel: 'Cédula de Identidad', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. 9-digit ID number' },
  { name: 'Croatia', code: 'HR', idLabel: 'Osobna Iskaznica', licenseLabel: 'Vozačka Dozvola', placeholder: 'e.g. 9-digit OIB number' },
  { name: 'Cuba', code: 'CU', idLabel: 'Carnet de Identidad', licenseLabel: 'Licencia de Conducción', placeholder: 'e.g. National ID Code' },
  { name: 'Cyprus', code: 'CY', idLabel: 'Identity Card', licenseLabel: 'Driving Licence', placeholder: 'e.g. 8-digit ID' },
  { name: 'Czech Republic', code: 'CZ', idLabel: 'Občanský Průkaz', licenseLabel: 'Řidičský Průkaz', placeholder: 'e.g. 9-digit ID Code' },
  { name: 'Denmark', code: 'DK', idLabel: 'Sundhedskort / National ID', licenseLabel: 'Kørekort', placeholder: 'e.g. CPR number' },
  { name: 'Dominican Republic', code: 'DO', idLabel: 'Cédula de Identidad y Electoral', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. 11-digit Cédula' },
  { name: 'Ecuador', code: 'EC', idLabel: 'Cédula de Identidad', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. 10-digit Cédula' },
  { name: 'Egypt', code: 'EG', idLabel: 'National ID Card', licenseLabel: 'Egyptian Driving Licence', placeholder: 'e.g. 14-digit National ID' },
  { name: 'El Salvador', code: 'SV', idLabel: 'DUI (Documento Único de Identidad)', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. DUI-Number' },
  { name: 'Estonia', code: 'EE', idLabel: 'ID-kaart (Identity Card)', licenseLabel: 'Juhiluba', placeholder: 'e.g. 11-digit Personal Code' },
  { name: 'Ethiopia', code: 'ET', idLabel: 'National ID / Kebele Card', licenseLabel: 'Ethiopian Driving License', placeholder: 'e.g. ID Card Number' },
  { name: 'Fiji', code: 'FJ', idLabel: 'Joint ID Card (FNPF/FRCS)', licenseLabel: 'Fiji Driving License', placeholder: 'e.g. TIN / ID Number' },
  { name: 'Finland', code: 'FI', idLabel: 'Henkilökortti', licenseLabel: 'Ajokortti', placeholder: 'e.g. Personal Identity Code' },
  { name: 'France', code: 'FR', idLabel: 'Carte Nationale d\'Identité (CNI)', licenseLabel: 'Permis de Conduire', placeholder: 'e.g. CNI 9-character code' },
  { name: 'Georgia', code: 'GE', idLabel: 'ID Card (Piradoba)', licenseLabel: 'Driving License', placeholder: 'e.g. 11-digit Personal No.' },
  { name: 'Germany', code: 'DE', idLabel: 'Personalausweis (National ID)', licenseLabel: 'Führerschein (Licence)', placeholder: 'e.g. ID card number' },
  { name: 'Ghana', code: 'GH', idLabel: 'Ghana Card', licenseLabel: 'DVLA Driving Licence', placeholder: 'e.g. GHA-XXXXXXXXX-X' },
  { name: 'Greece', code: 'GR', idLabel: 'Astynomiki Taftotita', licenseLabel: 'Diploma Odigisis', placeholder: 'e.g. Greek ID code' },
  { name: 'Guatemala', code: 'GT', idLabel: 'DPI Card', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. 13-digit DPI Code' },
  { name: 'Honduras', code: 'HN', idLabel: 'Tarjeta de Identidad', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. 13-digit ID' },
  { name: 'Hong Kong', code: 'HK', idLabel: 'HKID Card', licenseLabel: 'HK Driving Licence', placeholder: 'e.g. A123456(7)' },
  { name: 'Hungary', code: 'HU', idLabel: 'Személyigazolvány', licenseLabel: 'Vezetői Engedély', placeholder: 'e.g. 6 digits, 2 letters' },
  { name: 'Iceland', code: 'IS', idLabel: 'Nafnskírteini', licenseLabel: 'Ökuskírteini', placeholder: 'e.g. Kennditala No.' },
  { name: 'India', code: 'IN', idLabel: 'Aadhaar Card / PAN Card', licenseLabel: 'Indian Driving License', placeholder: 'e.g. 12-digit Aadhaar / PAN' },
  { name: 'Indonesia', code: 'ID', idLabel: 'KTP Card', licenseLabel: 'SIM (Driving License)', placeholder: 'e.g. 16-digit NIK' },
  { name: 'Iran', code: 'IR', idLabel: 'National ID Card', licenseLabel: 'Driving License', placeholder: 'e.g. 10-digit National Code' },
  { name: 'Iraq', code: 'IQ', idLabel: 'National Card', licenseLabel: 'Driving License', placeholder: 'e.g. Civil Status ID' },
  { name: 'Ireland', code: 'IE', idLabel: 'PSC (Public Services Card)', licenseLabel: 'Irish Driving Licence', placeholder: 'e.g. Card/PPS Number' },
  { name: 'Israel', code: 'IL', idLabel: 'Teudat Zehut', licenseLabel: 'Driving License', placeholder: 'e.g. 9-digit Zehut number' },
  { name: 'Italy', code: 'IT', idLabel: 'Carta d\'Identità', licenseLabel: 'Patente di Guida', placeholder: 'e.g. Italian ID number' },
  { name: 'Jamaica', code: 'JM', idLabel: 'National ID / Voter\'s Card', licenseLabel: 'Jamaican Driver\'s Licence', placeholder: 'e.g. 9-digit ID / TRN' },
  { name: 'Japan', code: 'JP', idLabel: 'My Number Card (Mynabar)', licenseLabel: 'Japanese Driver\'s License', placeholder: 'e.g. 12-digit My Number' },
  { name: 'Jordan', code: 'JO', idLabel: 'National ID Card', licenseLabel: 'Jordanian Driving License', placeholder: 'e.g. 10-digit National Number' },
  { name: 'Kazakhstan', code: 'KZ', idLabel: 'Identity Card (IIN)', licenseLabel: 'Driving License', placeholder: 'e.g. 12-digit IIN' },
  { name: 'Kenya', code: 'KE', idLabel: 'National ID Card', licenseLabel: 'Kenyan Driving Licence', placeholder: 'e.g. ID card number' },
  { name: 'Kuwait', code: 'KW', idLabel: 'Civil ID Card', licenseLabel: 'Driving License', placeholder: 'e.g. 12-digit Civil ID' },
  { name: 'Latvia', code: 'LV', idLabel: 'Personas Apliecība', licenseLabel: 'Vadītāja Apliecība', placeholder: 'e.g. Personal ID Code' },
  { name: 'Lebanon', code: 'LB', idLabel: 'Carte d\'Identité', licenseLabel: 'Permis de Conduire', placeholder: 'e.g. ID Number' },
  { name: 'Lithuania', code: 'LT', idLabel: 'Asmens tapatybės kortelė', licenseLabel: 'Vairuotojo pažymėjimas', placeholder: 'e.g. Personal Code' },
  { name: 'Luxembourg', code: 'LU', idLabel: 'Carte d\'Identité', licenseLabel: 'Permis de Conduire', placeholder: 'e.g. National ID' },
  { name: 'Malaysia', code: 'MY', idLabel: 'MyKad Card', licenseLabel: 'Malaysian Driving License', placeholder: 'e.g. YYMMDD-XX-XXXX' },
  { name: 'Malta', code: 'MT', idLabel: 'Identity Card', licenseLabel: 'Driving Licence', placeholder: 'e.g. Card ID + Identity No.' },
  { name: 'Mauritius', code: 'MU', idLabel: 'National Identity Card', licenseLabel: 'Driving Licence', placeholder: 'e.g. Personal ID Number' },
  { name: 'Mexico', code: 'MX', idLabel: 'INE / CURP Card', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. CURP 18-character code' },
  { name: 'Monaco', code: 'MC', idLabel: 'Carte d\'Identité', licenseLabel: 'Permis de Conduire', placeholder: 'e.g. Citizen Card Number' },
  { name: 'Morocco', code: 'MA', idLabel: 'CNIE (National ID)', licenseLabel: 'Permis de Conduire', placeholder: 'e.g. 2 letters, 6 digits' },
  { name: 'Nepal', code: 'NP', idLabel: 'National Identity Card', licenseLabel: 'Nepali Driving License', placeholder: 'e.g. Citizen Number' },
  { name: 'Netherlands', code: 'NL', idLabel: 'Identiteitskaart', licenseLabel: 'Rijbewijs', placeholder: 'e.g. BSN or Card Number' },
  { name: 'New Zealand', code: 'NZ', idLabel: 'Kiwi Access / 18+ Card', licenseLabel: 'NZ Driver\'s Licence', placeholder: 'e.g. Licence Number' },
  { name: 'Nicaragua', code: 'NI', idLabel: 'Cédula de Identidad', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. ID Card Number' },
  { name: 'Nigeria', code: 'NG', idLabel: 'National Identity Number (NIN)', licenseLabel: 'FRSC Driving Licence', placeholder: 'e.g. 11-digit NIN' },
  { name: 'Norway', code: 'NO', idLabel: 'Nasjonalt ID-kort', licenseLabel: 'Førerkort', placeholder: 'e.g. 11-digit Birth Number' },
  { name: 'Oman', code: 'OM', idLabel: 'Civil ID Card', licenseLabel: 'Omani Driving License', placeholder: 'e.g. Civil Number' },
  { name: 'Pakistan', code: 'PK', idLabel: 'CNIC (National ID)', licenseLabel: 'Driving License', placeholder: 'e.g. 35202-XXXXXXX-X' },
  { name: 'Panama', code: 'PA', idLabel: 'Cédula de Identidad', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. Cédula Number' },
  { name: 'Paraguay', code: 'PY', idLabel: 'Cédula de Identidad (CI)', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. CI Number' },
  { name: 'Peru', code: 'PE', idLabel: 'DNI Card', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. 8-digit DNI' },
  { name: 'Philippines', code: 'PH', idLabel: 'UMID / PhilID Card', licenseLabel: 'LTO Driver\'s License', placeholder: 'e.g. License/ID number' },
  { name: 'Poland', code: 'PL', idLabel: 'Dowód Osobisty', licenseLabel: 'Prawo Jazdy', placeholder: 'e.g. 3 letters, 6 digits' },
  { name: 'Portugal', code: 'PT', idLabel: 'Cartão de Cidadão', licenseLabel: 'Carta de Condução', placeholder: 'e.g. Citizens Card number' },
  { name: 'Qatar', code: 'QA', idLabel: 'Qatari ID Card', licenseLabel: 'Qatari Driving License', placeholder: 'e.g. QID number' },
  { name: 'Romania', code: 'RO', idLabel: 'Carte de Identitate', licenseLabel: 'Permis de Conducere', placeholder: 'e.g. Series and Number' },
  { name: 'Russia', code: 'RU', idLabel: 'Internal Passport', licenseLabel: 'Voditelskoe Udostoverenie', placeholder: 'e.g. 10-digit series/number' },
  { name: 'Saudi Arabia', code: 'SA', idLabel: 'National ID / Iqama', licenseLabel: 'Saudi Driving License', placeholder: 'e.g. Iqama/ID number' },
  { name: 'Senegal', code: 'SN', idLabel: 'Carte Nationale d\'Identité', licenseLabel: 'Permis de Conduire', placeholder: 'e.g. ID Code' },
  { name: 'Singapore', code: 'SG', idLabel: 'NRIC / FIN Card', licenseLabel: 'Driving Licence', placeholder: 'e.g. S1234567A' },
  { name: 'Slovakia', code: 'SK', idLabel: 'Občiansky Preukaz', licenseLabel: 'Vodičský Preukaz', placeholder: 'e.g. ID Card Number' },
  { name: 'Slovenia', code: 'SI', idLabel: 'Osebna Izkaznica', licenseLabel: 'Vozniško Dovoljenje', placeholder: 'e.g. Personal ID Code' },
  { name: 'South Africa', code: 'ZA', idLabel: 'Smart ID Card / Green Book', licenseLabel: 'SA Driving Licence', placeholder: 'e.g. 13-digit ID number' },
  { name: 'South Korea', code: 'KR', idLabel: 'Resident Registration Card', licenseLabel: 'Driver\'s License', placeholder: 'e.g. YYMMDD-XXXXXXX' },
  { name: 'Spain', code: 'ES', idLabel: 'DNI / NIE', licenseLabel: 'Permiso de Conducir', placeholder: 'e.g. DNI number with letter' },
  { name: 'Sri Lanka', code: 'LK', idLabel: 'National ID Card (NIC)', licenseLabel: 'Sri Lankan Driving License', placeholder: 'e.g. NIC Number' },
  { name: 'Sweden', code: 'SE', idLabel: 'Identitetskort', licenseLabel: 'Körkort', placeholder: 'e.g. Personal Identity Number' },
  { name: 'Switzerland', code: 'CH', idLabel: 'Identitätskarte / Carte d\'identité', licenseLabel: 'Führerausweis', placeholder: 'e.g. Swiss ID Card number' },
  { name: 'Taiwan', code: 'TW', idLabel: 'National Identification Card', licenseLabel: 'Taiwanese Driver\'s License', placeholder: 'e.g. Letter + 9 digits' },
  { name: 'Thailand', code: 'TH', idLabel: 'Thai National ID Card', licenseLabel: 'Thai Driving License', placeholder: 'e.g. 13-digit ID' },
  { name: 'Tunisia', code: 'TN', idLabel: 'Carte Nationale d\'Identité', licenseLabel: 'Permis de Conduire', placeholder: 'e.g. National ID' },
  { name: 'Turkey', code: 'TR', idLabel: 'T.C. Kimlik Kartı', licenseLabel: 'Sürücü Belgesi', placeholder: 'e.g. 11-digit Kimlik No' },
  { name: 'Uganda', code: 'UG', idLabel: 'National ID Card', licenseLabel: 'Ugandan Driving License', placeholder: 'e.g. NIN Number' },
  { name: 'Ukraine', code: 'UA', idLabel: 'ID-Passport (Identity Card)', licenseLabel: 'Posvidchennya Vodiya', placeholder: 'e.g. 9-digit ID card number' },
  { name: 'United Arab Emirates', code: 'AE', idLabel: 'Emirates ID Card', licenseLabel: 'UAE Driving Licence', placeholder: 'e.g. 784-XXXX-XXXXXXX-X' },
  { name: 'United Kingdom', code: 'GB', idLabel: 'National Insurance / BRP', licenseLabel: 'DVLA Driving Licence', placeholder: 'e.g. QQ 12 34 56 A' },
  { name: 'United States', code: 'US', idLabel: 'SSN / State ID', licenseLabel: 'State Driver\'s License', placeholder: 'e.g. XXX-XX-XXXX or State ID' },
  { name: 'Uruguay', code: 'UY', idLabel: 'Cédula de Identidad', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. Cédula Number' },
  { name: 'Uzbekistan', code: 'UZ', idLabel: 'Identity Card', licenseLabel: 'Driving License', placeholder: 'e.g. Passport/ID series & No.' },
  { name: 'Venezuela', code: 'VE', idLabel: 'Cédula de Identidad', licenseLabel: 'Licencia de Conducir', placeholder: 'e.g. Cédula Number' },
  { name: 'Vietnam', code: 'VN', idLabel: 'Căn Cước Công Dân (CCCD)', licenseLabel: 'Driving License (GPLX)', placeholder: 'e.g. 12-digit CCCD' },
  { name: 'Zimbabwe', code: 'ZW', idLabel: 'National ID Card', licenseLabel: 'Zimbabwe Driving License', placeholder: 'e.g. ID Card Number' },
  { name: 'Rest of the World', code: 'ROW', idLabel: 'Government ID Card', licenseLabel: 'National Driving License', placeholder: 'e.g. National Identification Number' }
];

export default function AuthKycModal({
  isOpen,
  onClose,
  initialTab = 'login',
  account,
  onUpdateAccount,
  onReplaceAccount,
  onClearHistory,
  onTriggerToast,
  onPlaySound
}: AuthKycModalProps) {
  // Navigation & Step states
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'kyc'>(initialTab);
  const [kycStep, setKycStep] = useState<number>(1); // 1 = details, 2 = upload, 3 = scanning/processing, 4 = approved

  // Auth Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0: enter email, 1: enter OTP, new pass, security answer
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);


  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    setAuthError('');
    onTriggerToast?.('LEVEL_UP', 'SENDING OTP', `Requesting a new code for ${email}...`);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });
      const data = await response.json();
      onTriggerToast?.('LEVEL_UP', 'VERIFICATION SENT', data.otp ? `Demo Mode OTP: ${data.otp}` : `A new verification code has been sent to ${email}.`);
    } catch (err) {
      console.error(err);
      setAuthError('Failed to resend OTP. Check connection.');
    }
  };
  const [referralCode, setReferralCode] = useState('');

  // Auto-fill affiliate referral code if present in URL or sessionStorage
  React.useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('ref') || params.get('aff');
      if (urlCode) {
        setReferralCode(urlCode.toUpperCase());
        return;
      }
      const sessionCode = sessionStorage.getItem('vertex_ref_code');
      if (sessionCode) {
        setReferralCode(sessionCode.toUpperCase());
      }
    }
  }, [isOpen]);

  // KYC Inputs
  const [kycCountry, setKycCountry] = useState('United States');
  const [kycLegalName, setKycLegalName] = useState('');
  const [kycDob, setKycDob] = useState('');
  const [kycDocType, setKycDocType] = useState<'PASSPORT' | 'ID_CARD' | 'DRIVERS_LICENSE'>('PASSPORT');
  const [kycDocNumber, setKycDocNumber] = useState('');
  const [kycIdImage, setKycIdImage] = useState<string>('');
  const [kycSelfieImage, setKycSelfieImage] = useState<string>('');
  
  const [dragActive, setDragActive] = useState(false);

  // Animation states for scanning
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepText, setScanStepText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentCountryConfig = COUNTRIES_DATABASE.find(c => c.name === kycCountry) || COUNTRIES_DATABASE[COUNTRIES_DATABASE.length - 1];

  // Sync active tab if initialTab changes on open
  React.useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
    if (initialTab === 'kyc') {
      if (account.kycStatus === 'VERIFIED') {
        setKycStep(4);
      } else if (account.kycStatus === 'PENDING') {
        setKycStep(3);
        // resume animation if pending
        runVerificationScan();
      } else {
        setKycStep(1);
      }
    }
  }, [isOpen, initialTab]);

  // Sound helper
  const clickSound = () => onPlaySound?.('CLICK');
  const winSound = () => onPlaySound?.('WIN');

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    if (!email || !password) {
      setAuthError('Please fill in all credentials.');
      setIsLoading(false);
      return;
    }

    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginRes.json();
      
      if (loginData.user) { setPendingUser(loginData.user); }
      if (!loginData.success) {
        setAuthError(loginData.error || 'Incorrect email or password.');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });
      const data = await response.json();
      if (data.success) {
        setResendTimer(60);
      }
      setIsLoading(false);
      setOtpStep(true);
      onTriggerToast?.('LEVEL_UP', 'VERIFICATION REQUIRED', data.otp ? `Demo Mode OTP: ${data.otp}` : `We've sent a code to ${email} to confirm your login.`);
    } catch (err) {
      console.error(err);
      setAuthError('Failed to connect. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    if (!fullName || !email || !password || !confirmPassword) {
      setAuthError('All registration fields are required.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    setTimeout(async () => {
      let otpMsg = `An OTP has been sent to ${email}.`;
      try {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
        const data = await response.json();
        if (data.success) {
          setResendTimer(60);
          if (data.otp) otpMsg = `Demo Mode OTP: ${data.otp}`;
        }
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
      setOtpStep(true);
      onTriggerToast?.('LEVEL_UP', 'VERIFICATION REQUIRED', otpMsg);
    }, 1500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (otpValue.length < 6) {
      setAuthError('OTP must be 6 characters.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue })
      });
      
      const data = await response.json();
      setIsLoading(false);
      
      if (data.success) {
        winSound();
        if (onClearHistory) onClearHistory();
        const derivedName = fullName || email.split('@')[0].toUpperCase();
        const cleanRefCode = referralCode ? referralCode.trim().toUpperCase() : '';
        const generatedCode = derivedName.replace(/\s+/g, '').toUpperCase().slice(0, 10);
        
        if (pendingUser && onReplaceAccount) {
          onReplaceAccount({ ...pendingUser, isLoggedIn: true });
        } else if (onReplaceAccount) {
          onReplaceAccount({
            email: email,
            fullName: derivedName,
            balanceDemo: 10000.0,
            balanceLive: 0.0,
            level: 1,
            xp: 0,
            isLive: false,
            badges: [],
            isLoggedIn: true,
            kycStatus: 'UNVERIFIED',
            joinedTournaments: [],
            tournamentScores: {},
            weeklyProfit: 0,
            referredBy: cleanRefCode || undefined,
            password: password,
            securityAnswer: securityAnswer,
            affiliateCode: generatedCode,
            affiliateBalance: 0,
            referralsCount: 0
          });
        }
        
        onTriggerToast?.('LEVEL_UP', 'EMAIL VERIFIED', `Welcome to Vertex Options, ${derivedName}!`);
        setOtpStep(false);
        
        if (account.kycStatus !== 'VERIFIED') {
          setActiveTab('kyc');
          setKycStep(1);
        } else {
          onClose();
        }
      } else {
        setAuthError(data.error || 'Invalid Verification Code.');
      }
    } catch (err) {
      setIsLoading(false);
      setAuthError('Failed to verify OTP. Check connection.');
    }
  };

  // Pre-fill demo account for fast testing
  const handleUseDemoCreds = () => {
    clickSound();
    setEmail('demo@vertexmarket.com');
    setPassword('demo1234');
    setFullName('Demo User');
  };

  // Drag and drop event handlers
  
  const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setKycIdImage(reader.result as string);
      reader.readAsDataURL(file);
      clickSound();
    }
  };

  const handleSelfieImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setKycSelfieImage(reader.result as string);
      reader.readAsDataURL(file);
      clickSound();
    }
  };

  const handleUploadDummy = () => {
    // Set some random dummy base64 images
    setKycIdImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='); // red pixel
    setKycSelfieImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='); // blue pixel
    clickSound();
  };

  const handleBiometricScan = () => {
    clickSound();
    setKycIdImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='); // Mock ID
    setKycSelfieImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='); // Mock Selfie
    setTimeout(() => {
      runVerificationScan();
    }, 500);
  };

  // KYC Form Details submit
  const handleKycDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clickSound();
    if (!kycLegalName || !kycDob || !kycDocNumber) {
      setAuthError('Please fill in all identity credentials to proceed.');
      return;
    }
    setAuthError('');
    setKycStep(2);
  };

  // Trigger Scanning Simulation
  const runVerificationScan = async () => {
    setKycStep(3);
    setScanProgress(0);
    setScanStepText('Uploading encrypted identity packets...');
    
    // Start fake progress while we wait for the server
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 5;
      if (currentProgress > 90) currentProgress = 90; // clamp to 90% until done
      
      if (currentProgress <= 25) {
        setScanStepText('Establishing high-security bio-hash pipeline...');
      } else if (currentProgress <= 55) {
        setScanStepText('Scanning document layout & security holographic seals...');
      } else if (currentProgress <= 80) {
        setScanStepText('AI Face Match: Analyzing photo coordinates vs biometric indices...');
      } else {
        setScanStepText('Running blacklist & anti-money laundering global ledger queries...');
      }
      setScanProgress(Math.min(currentProgress, 90));
    }, 200);

    try {
      const response = await fetch('/api/kyc/auto-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: account.email,
          idImage: kycIdImage,
          selfieImage: kycSelfieImage
        })
      });
      
      const data = await response.json();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      setScanStepText('Verification complete.');
      
      setTimeout(() => {
        if (data.status === 'VERIFIED') {
          winSound();
          onUpdateAccount({
            kycStatus: 'VERIFIED',
            fullName: kycLegalName || account.fullName || 'Verified Trader',
            xp: account.xp + 150
          });
          setKycStep(4);
          onTriggerToast?.('WIN', 'IDENTITY VERIFIED', 'Congratulations! Your KYC is approved. Real-funds Live Trading is unlocked!');
        } else {
          // PENDING (manual review)
          onUpdateAccount({
            kycStatus: 'PENDING',
            fullName: kycLegalName || account.fullName || 'Pending Trader',
            kycIdImage: kycIdImage,
            kycSelfieImage: kycSelfieImage,
            kycSubmittedAt: Date.now()
          });
          setKycStep(4);
          onTriggerToast?.('LEVEL_UP', 'MANUAL REVIEW REQUIRED', data.message || 'Identity sent to manual review queue.');
        }
      }, 500);
      
    } catch (err) {
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setTimeout(() => {
        // Fallback to pending
        onUpdateAccount({
          kycStatus: 'PENDING',
          fullName: kycLegalName || account.fullName || 'Pending Trader',
          kycIdImage: kycIdImage,
          kycSelfieImage: kycSelfieImage,
          kycSubmittedAt: Date.now()
        });
        setKycStep(4);
        onTriggerToast?.('LEVEL_UP', 'MANUAL REVIEW REQUIRED', 'Could not reach verification server. Sent to manual queue.');
      }, 500);
    }
  };

  if (!isOpen) return null;

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    if (forgotPasswordStep === 0) {
      if (!email) {
        setAuthError('Please enter your email.');
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
           setResendTimer(60);
           setForgotPasswordStep(1);
           onTriggerToast?.('LEVEL_UP', 'OTP SENT', data.otp ? `Demo Mode OTP: ${data.otp}` : `Verification code sent to ${email}`);
        } else {
           setAuthError('Failed to send OTP.');
        }
      } catch (err) {
        setAuthError('Network error.');
      }
      setIsLoading(false);
    } else {
      if (!otpValue || !password || !securityAnswer) {
        setAuthError('All fields are required.');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: otpValue, newPassword: password, securityAnswer })
        });
        const data = await res.json();
        if (data.success) {
           if(typeof window !== "undefined") {
             const audio = new Audio('/sounds/win.mp3');
             audio.volume = 0.5;
             audio.play().catch(()=>{});
           }
           onTriggerToast?.('LEVEL_UP', 'PASSWORD RESET', 'Your password has been changed successfully.');
           setIsForgotPassword(false);
           setForgotPasswordStep(0);
           setOtpValue('');
           setPassword('');
           setConfirmPassword('');
           setSecurityAnswer('');
        } else {
           setAuthError(data.error || 'Failed to reset password.');
        }
      } catch (err) {
        setAuthError('Network error.');
      }
      setIsLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md overflow-y-auto z-50 select-none animate-fade-in" id="auth-kyc-modal-overlay">
        <div className="flex min-h-full items-center justify-center p-4 py-10">
          <div className="relative bg-[#090d16] border border-white/10 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl flex flex-col p-6">
            <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-sm text-gray-400 mb-6">
              {forgotPasswordStep === 0 ? "Enter your email to receive a reset code." : "Enter the code, security answer, and your new password."}
            </p>
            
            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{authError}</p>
              </div>
            )}
            
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              {forgotPasswordStep === 0 ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">6-Digit Code</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000000"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-center tracking-[0.5em]"
                      />
                    </div>
                    <div className="flex justify-end mt-1">
                      <button 
                        type="button" 
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0}
                        className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Security Question: Mother's Maiden Name?</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        placeholder="e.g. Smith"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  forgotPasswordStep === 0 ? "Send Reset Code" : "Reset Password"
                )}
              </button>
              
              <button 
                type="button" 
                onClick={() => setIsForgotPassword(false)} 
                className="text-xs text-gray-500 hover:text-white transition-colors text-center mt-2"
              >
                &larr; Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md overflow-y-auto z-50 select-none animate-fade-in" id="auth-kyc-modal-overlay">
      <div className="flex min-h-full items-center justify-center p-4 py-10">
        <div 
          className="relative bg-[#090d16] border border-white/10 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl shadow-emerald-500/5 flex flex-col"
        id="auth-kyc-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative ambient glowing grids */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-purple-500 to-indigo-500"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0d1320]/80">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => { clickSound(); onClose(); }}
              className="p-1.5 mr-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Back</span>
            </button>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-white font-sans font-bold text-sm tracking-wide">
                {activeTab === 'kyc' ? 'KYC IDENTITY SECURITY DESK' : 'VERTEX ACCOUNT TERMINAL'}
              </h3>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase mt-0.5">
                SECURE 256-BIT ENCRYPTION ACTIVE
              </p>
            </div>
          </div>
          <button 
            onClick={() => { clickSound(); onClose(); }}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            id="close-auth-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (only shown if not in the middle of active KYC scanning) */}
        {kycStep !== 3 && (
          <div className="flex border-b border-white/5 bg-[#0a0f1b]" id="modal-tabs-header">
            <button
              onClick={() => { clickSound(); setActiveTab('login'); setAuthError(''); }}
              className={`flex-1 py-3 text-center text-xs font-sans font-medium border-b-2 transition-all ${
                activeTab === 'login'
                  ? 'border-emerald-500 text-white bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { clickSound(); setActiveTab('signup'); setAuthError(''); }}
              className={`flex-1 py-3 text-center text-xs font-sans font-medium border-b-2 transition-all ${
                activeTab === 'signup'
                  ? 'border-emerald-500 text-white bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => {
                clickSound();
                if (!account.isLoggedIn) {
                  setAuthError('Please sign in or create an account before launching KYC verification.');
                  setActiveTab('login');
                  return;
                }
                setActiveTab('kyc');
                setAuthError('');
              }}
              className={`flex-1 py-3 text-center text-xs font-sans font-medium border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'kyc'
                  ? 'border-emerald-500 text-white bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Identity KYC
            </button>
          </div>
        )}

        {/* Content Panel */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* Error Message */}
          {authError && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded p-3 text-xs text-rose-400 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Tab 1: LOGIN */}
          {activeTab === 'login' && (
            <div className="flex flex-col gap-4">
              {otpStep ? (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3.5">
                  <div className="text-center mb-1">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">Verify Your Email to Login</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      We've sent a 6-digit verification code to <span className="text-emerald-400">{email}</span>.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Verification Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.toUpperCase())}
                        className="w-full bg-[#0a0c10] border border-white/10 rounded-md py-2.5 pl-10 pr-3 text-white text-sm font-mono tracking-[0.3em] text-center uppercase focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-gray-600 placeholder:tracking-normal"
                        placeholder="000000"
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-md text-xs flex items-start gap-2 mt-1">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{authError}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-sans tracking-wide py-2.5 rounded-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Sign In'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <button type="button" onClick={() => setOtpStep(false)} className="text-xs text-gray-500 hover:text-white transition-colors">
                      &larr; Back to Login
                    </button>
                    <button 
                      type="button" 
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0}
                      className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="text-center mb-1">
                <p className="text-xs text-gray-400">
                  Access your portfolio, trade history, and customized indicators.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Password</label>
                  <a href="#reset" onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); }} className="text-[10px] text-emerald-500 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold py-2.5 rounded text-xs transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synchronizing Secure Protocol...</span>
                  </>
                ) : (
                  <span>Sign In to Terminal</span>
                )}
              </button>
            </form>
              )}
            </div>
          )}

          {/* Tab 2: SIGN UP */}
          {activeTab === 'signup' && (
            <div className="flex flex-col gap-3.5">
              {otpStep ? (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3.5">
                  <div className="text-center mb-1">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">Verify Your Email</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      We've sent a 6-digit verification code to <span className="text-emerald-400">{email}</span>.
                      <br/>Please check your inbox and spam folder.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Verification Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.toUpperCase())}
                        className="w-full bg-[#0a0c10] border border-white/10 rounded-md py-2.5 pl-10 pr-3 text-white text-sm font-mono tracking-[0.3em] text-center uppercase focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-gray-600 placeholder:tracking-normal"
                        placeholder="000000"
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-md text-xs flex items-start gap-2 mt-1">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{authError}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-sans tracking-wide py-2.5 rounded-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Email & Continue'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <button type="button" onClick={() => setOtpStep(false)} className="text-xs text-gray-500 hover:text-white transition-colors">
                      &larr; Back to Registration
                    </button>
                    <button 
                      type="button" 
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0}
                      className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-3.5">
              <div className="text-center mb-1">
                <p className="text-xs text-gray-400">
                  Register a secure options profile. Standard account setup is instantaneous.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Affiliate / Referral Code (Optional)</label>
                <div className="relative">
                  <Gift className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Enter partner code (auto-filled if using a referral link)"
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 mt-1">
                <input
                  type="checkbox"
                  required
                  id="agree-checkbox"
                  className="mt-0.5 rounded border-white/10 bg-white/5 text-emerald-600 focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="agree-checkbox" className="text-[10px] text-gray-400 leading-tight">
                  I certify that I am at least 18 years of age, and agree to the Vertex Trading Terms of Service and Privacy Policy.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold py-2.5 rounded text-xs transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Spinning up credentials database...</span>
                  </>
                ) : (
                  <span>Register Credentials & Verify Identity</span>
                )}
              </button>
            </form>
              )}
            </div>
          )}

          {/* Tab 3: KYC IDENTITY VERIFICATION */}
          {activeTab === 'kyc' && (
            <div className="flex flex-col gap-4">
              {/* Step indicator */}
              <div className="flex items-center justify-between bg-[#0e1423] p-3 rounded border border-white/5 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${kycStep >= 1 ? 'bg-emerald-500 text-[#090d16]' : 'bg-white/5 text-gray-400'}`}>1</div>
                  <span className="text-[10px] font-sans font-semibold text-gray-200">Details</span>
                </div>
                <div className="h-px w-8 bg-white/10 flex-1 mx-2"></div>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${kycStep >= 2 ? 'bg-emerald-500 text-[#090d16]' : 'bg-white/5 text-gray-400'}`}>2</div>
                  <span className="text-[10px] font-sans font-semibold text-gray-300">Upload Doc</span>
                </div>
                <div className="h-px w-8 bg-white/10 flex-1 mx-2"></div>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${kycStep >= 3 ? 'bg-emerald-500 text-[#090d16]' : 'bg-white/5 text-gray-400'}`}>3</div>
                  <span className="text-[10px] font-sans font-semibold text-gray-300">Scan</span>
                </div>
                <div className="h-px w-8 bg-white/10 flex-1 mx-2"></div>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${kycStep >= 4 ? 'bg-emerald-500 text-[#090d16]' : 'bg-white/5 text-gray-400'}`}>4</div>
                  <span className="text-[10px] font-sans font-semibold text-gray-300">Status</span>
                </div>
              </div>

              {/* KYC Step 1: Personal Details */}
              {kycStep === 1 && (
                <form onSubmit={handleKycDetailsSubmit} className="flex flex-col gap-3.5">
                  <div className="text-center mb-1">
                    <p className="text-xs text-gray-300 font-sans">
                      International regulations require standard identity proofing to initiate real trading. Submit your details for instant analysis.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Country of Residence</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                        <select
                          value={kycCountry}
                          onChange={(e) => setKycCountry(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans appearance-none focus:outline-none focus:border-emerald-500/50"
                        >
                          {COUNTRIES_DATABASE.map((country) => (
                            <option key={country.code} value={country.name} className="bg-[#090d16]">
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                        <input
                          type="date"
                          required
                          value={kycDob}
                          onChange={(e) => setKycDob(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Legal Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={kycLegalName}
                        onChange={(e) => setKycLegalName(e.target.value)}
                        placeholder="Must match your government-issued ID card exactly"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded border border-white/5">
                    <button
                      type="button"
                      onClick={() => { clickSound(); setKycDocType('PASSPORT'); }}
                      className={`py-2 px-1 rounded text-[11px] truncate transition-all ${kycDocType === 'PASSPORT' ? 'bg-[#090d16] text-emerald-400 font-semibold border border-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
                      title="Passport Document"
                    >
                      Passport
                    </button>
                    <button
                      type="button"
                      onClick={() => { clickSound(); setKycDocType('ID_CARD'); }}
                      className={`py-2 px-1 rounded text-[11px] truncate transition-all ${kycDocType === 'ID_CARD' ? 'bg-[#090d16] text-emerald-400 font-semibold border border-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
                      title={currentCountryConfig.idLabel}
                    >
                      {currentCountryConfig.idLabel.split(' / ')[0]}
                    </button>
                    <button
                      type="button"
                      onClick={() => { clickSound(); setKycDocType('DRIVERS_LICENSE'); }}
                      className={`py-2 px-1 rounded text-[11px] truncate transition-all ${kycDocType === 'DRIVERS_LICENSE' ? 'bg-[#090d16] text-emerald-400 font-semibold border border-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
                      title={currentCountryConfig.licenseLabel}
                    >
                      License
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">
                      {kycDocType === 'PASSPORT' 
                        ? 'Passport Identification Number' 
                        : kycDocType === 'ID_CARD' 
                        ? `${currentCountryConfig.idLabel} ID Number` 
                        : `${currentCountryConfig.licenseLabel} Number`
                      }
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={kycDocNumber}
                        onChange={(e) => setKycDocNumber(e.target.value)}
                        placeholder={
                          kycDocType === 'PASSPORT' 
                            ? 'e.g. 9-character passport ID' 
                            : kycDocType === 'ID_CARD' 
                            ? currentCountryConfig.placeholder 
                            : 'e.g. license serial number'
                        }
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 pl-10 text-white text-xs font-sans focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold py-2.5 rounded text-xs transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>Proceed to Document Upload</span>
                  </button>
                </form>
              )}

              {/* KYC Step 2: Document Upload */}
              {kycStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="text-center">
                    <h4 className="text-white font-semibold text-sm">Upload KYC Documents</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Upload your ID and a self-portrait to proceed.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleBiometricScan}
                      className="group relative overflow-hidden flex flex-col items-center justify-center gap-3 py-6 px-4 bg-[#0a0f1d] border border-blue-500/30 hover:border-blue-400/50 rounded-xl transition-all"
                    >
                      <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/50 transform -translate-y-full group-hover:animate-scanner-line"></div>
                      <div className="flex items-center gap-4 text-blue-400">
                        <ScanFace className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <Fingerprint className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-bold text-white tracking-wide">Quick Biometric Scan</span>
                        <span className="block text-[10px] text-gray-400 font-mono uppercase mt-1">Use FaceID or Fingerprint (Mock)</span>
                      </div>
                    </button>

                    <div className="flex items-center gap-3 py-2">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase">OR MANUAL UPLOAD</span>
                      <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <div className="border border-white/10 rounded-lg p-3 bg-white/5">
                      <label className="text-xs text-white font-mono uppercase block mb-2">ID Document (Front)</label>
                      <input type="file" onChange={handleIdImageChange} accept="image/*" className="text-xs text-gray-400 w-full file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30" />
                      {kycIdImage && <div className="mt-2 text-xs text-emerald-400 font-mono">ID Uploaded ✓</div>}
                    </div>

                    <div className="border border-white/10 rounded-lg p-3 bg-white/5">
                      <label className="text-xs text-white font-mono uppercase block mb-2">Self-Portrait (Selfie)</label>
                      <input type="file" onChange={handleSelfieImageChange} accept="image/*" className="text-xs text-gray-400 w-full file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30" />
                      {kycSelfieImage && <div className="mt-2 text-xs text-emerald-400 font-mono">Selfie Uploaded ✓</div>}
                    </div>
                  </div>


                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => { clickSound(); setKycStep(1); }}
                      className="flex-1 py-2 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-300 font-sans"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => { clickSound(); runVerificationScan(); }}
                      disabled={!kycIdImage || !kycSelfieImage}
                      className="flex-[2] py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit & Scan
                    </button>
                  </div>
                </div>
              )}
              {kycStep === 3 && (
                <div className="flex flex-col gap-5 text-center py-6 relative overflow-hidden">
                  <div className="text-center">
                    <h4 className="text-white font-bold text-sm tracking-wide">Vertex Advanced Bio-ID Engine</h4>
                    <p className="text-xs text-gray-400 mt-1">Analyzing security indexes using advanced machine learning...</p>
                  </div>

                  {/* Scan Animation Container */}
                  <div className="w-full max-w-xs mx-auto relative h-36 bg-[#04060b] border border-emerald-500/30 rounded-xl overflow-hidden flex items-center justify-center group shadow-inner shadow-emerald-950/40">
                    {/* Glowing Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:10px_10px]"></div>

                    {/* Laser Scanner bar */}
                    <div className="absolute left-0 w-full h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-scanner-line z-20"></div>

                    {/* Holographic passport mock representation */}
                    <div className="relative w-52 h-24 border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-2.5 flex items-start gap-2 text-left select-none animate-pulse">
                      <div className="w-12 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center justify-center shrink-0">
                        <User className="w-7 h-7 text-emerald-500/50" />
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5 font-mono">
                        <div className="h-2 w-28 bg-emerald-500/20 rounded"></div>
                        <div className="h-1.5 w-20 bg-emerald-500/15 rounded"></div>
                        <div className="h-1.5 w-16 bg-emerald-500/10 rounded"></div>
                        <div className="h-2 w-24 bg-emerald-500/20 rounded mt-2"></div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-sm mx-auto flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-emerald-400 animate-pulse">{scanStepText}</span>
                      <span className="text-white font-bold">{scanProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 transition-all duration-150"
                        style={{ width: `${scanProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* KYC Step 4: Approved Completed */}
              {kycStep === 4 && (
                <div className="flex flex-col items-center justify-center gap-4 py-8 text-center animate-fade-in">
                  <div className="relative">
                    <div className={`absolute inset-0 blur-xl rounded-full ${account?.kycStatus === 'VERIFIED' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}></div>
                    <div className={`relative w-16 h-16 rounded-full border flex items-center justify-center mb-2 ${account?.kycStatus === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                      {account?.kycStatus === 'VERIFIED' ? <CheckCircle2 className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      {account?.kycStatus === 'VERIFIED' ? 'Identity Verified!' : 'Under Review'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
                      {account?.kycStatus === 'VERIFIED' 
                        ? 'Your identity documents have been automatically verified by our AI compliance engine.' 
                        : 'Your identity documents have been submitted to our secure ledger and are awaiting manual review by a compliance officer.'}
                    </p>
                  </div>
                  <button
                    onClick={() => { clickSound(); onClose(); }}
                    className="mt-4 px-8 py-2.5 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold font-mono tracking-wider transition-all"
                  >
                    Return to Terminal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
