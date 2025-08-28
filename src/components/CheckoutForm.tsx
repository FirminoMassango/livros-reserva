import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/hooks/useCart';
import { CreateReservationData } from '@/hooks/useReservations';
import { ArrowLeft, User, Phone, FileText, CreditCard, Smartphone, CheckCircle2, Circle } from 'lucide-react';
import { formatarValor } from '@/lib/utils';

interface CheckoutFormProps {
  cartItems: CartItem[];
  total: number;
  onSubmit: (data: CreateReservationData & { payment_method: string; card_number?: string; cvv?: string; mobile_wallet_contact?: string }) => void;
  onBack: () => void;
  loading?: boolean;
  confirmButtonText: string;
}

const PaymentMethods = ({ formData, handleInputChange, validateMpesaNumber, formatCardNumber, validateExpiry, validateCVV }) => {
  return (
    <div className="space-y-6">
      <Label className="text-base font-semibold">Método de Pagamento *</Label>
      <div className="grid gap-4">
        {/* M-Pesa */}
        <div
          className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition hover:border-primary ${
            formData.payment_method === "M-Pesa" ? "border-primary bg-primary/5" : "border-muted"
          }`}
          onClick={() => handleInputChange("payment_method", "M-Pesa")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-primary" />
              <span className="font-medium">M-Pesa</span>
            </div>
            {formData.payment_method === "M-Pesa" ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          {formData.payment_method === "M-Pesa" && (
            <div className="mt-3 space-y-2">
              <Label htmlFor="mobile-wallet-contact">Número M-Pesa</Label>
              <Input
                id="mobile-wallet-contact"
                value={formData.mobile_wallet_contact || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 9) handleInputChange('mobile_wallet_contact', value);
                }}
                placeholder="+258 84 XXX XXXX or +258 85 XXX XXXX"
                maxLength={9}
                required
              />
              {formData.mobile_wallet_contact && formData.mobile_wallet_contact.length === 9 && !validateMpesaNumber(formData.mobile_wallet_contact) && (
                <p className="text-sm text-red-500">O número deve começar com 84 ou 85.</p>
              )}
            </div>
          )}
        </div>

        {/* Cartão */}
        <div
          className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition hover:border-primary ${
            formData.payment_method === "Cartão" ? "border-primary bg-primary/5" : "border-muted"
          }`}
          onClick={() => handleInputChange("payment_method", "Cartão")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="font-medium">Cartão</span>
            </div>
            {formData.payment_method === "Cartão" ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          {formData.payment_method === "Cartão" && (
            <div className="mt-3 space-y-3">
              <div>
                <Label htmlFor="card-number">Número do Cartão</Label>
                <Input
                  id="card-number"
                  value={formData.card_number || ''}
                  onChange={(e) => handleInputChange("card_number", e.target.value)}
                  placeholder="XXXX XXXX XXXX XXXX"
                  maxLength={19}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiry">Validade</Label>
                  <Input
                    id="expiry"
                    value={formData.notes || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length > 2 && !formData.notes.includes('/')) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      if (value.length <= 5) handleInputChange("notes", value);
                    }}
                    placeholder="MM/AA"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={formData.cvv || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 3) handleInputChange("cvv", value);
                    }}
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="additional-notes" className="flex items-center gap-2">
          Observações (opcional)
        </Label>
        <Textarea
          id="additional-notes"
          value={formData.additionalNotes || ''}
          onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
          placeholder="Observações adicionais..."
          rows={3}
        />
      </div>
    </div>
  );
};

export function CheckoutForm({
  cartItems,
  total,
  onSubmit,
  onBack,
  loading = false,
  confirmButtonText
}: CheckoutFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateReservationData & { payment_method: string; card_number?: string; cvv?: string; mobile_wallet_contact?: string; additionalNotes?: string }>({
    customer_name: '',
    customer_phone: '',
    customer_alternative_phone: '',
    payment_method: '',
    notes: '',
    card_number: '',
    cvv: '',
    mobile_wallet_contact: '',
    additionalNotes: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleInputChange = (field: keyof (CreateReservationData & { payment_method: string; card_number?: string; cvv?: string; mobile_wallet_contact?: string; additionalNotes?: string }), value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 16) cleaned = cleaned.slice(0, 16);
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += cleaned[i];
    }
    return formatted;
  };

  const validateExpiry = (value: string) => {
    const [mm, aa] = value.split('/').map(v => v.replace(/\D/g, ''));
    const currentYear = new Date().getFullYear() % 100;
    const maxYear = (currentYear + 10) % 100;
    return mm && aa && mm >= '01' && mm <= '12' && Number(aa) >= currentYear && Number(aa) <= maxYear;
  };

  const validateCVV = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 3;
  };

  const validateMpesaNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 9 && (cleaned.startsWith('84') || cleaned.startsWith('85'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      if (step === 2 && formData.payment_method === 'Cartão') {
        const cardNumber = formData.card_number?.replace(/\s/g, '') || '';
        if (cardNumber.length !== 16 || !validateExpiry(formData.notes) || !validateCVV(formData.cvv || '')) return;
      } else if (step === 2 && formData.payment_method === 'M-Pesa') {
        if (!validateMpesaNumber(formData.mobile_wallet_contact || '')) return;
      }
      nextStep();
    } else {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setFormData({
          customer_name: '',
          customer_phone: '',
          customer_alternative_phone: '',
          payment_method: '',
          notes: '',
          card_number: '',
          cvv: '',
          mobile_wallet_contact: '',
          additionalNotes: '',
        });
        setStep(1);
        onBack();
      }, 5000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Finalize seu pagamento em 3 etapas</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between w-full mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center">
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-colors ${
                step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground border border-primary'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-[3px] ${step > s ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Nome Completo *
                  </Label>
                  <Input
                    id="name"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Número de Telefone *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.customer_phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 9) handleInputChange('customer_phone', value);
                    }}
                    placeholder="+258 XX XXX XXXX"
                    maxLength={9}
                    required
                  />
                  {formData.customer_phone.length === 9 && !validateMpesaNumber(formData.customer_phone) && (
                    <p className="text-sm text-red-500">O número deve começar com 84 ou 85.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_alternative_phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Telefone Alternativo (opcional)
                  </Label>
                  <Input
                    id="customer_alternative_phone"
                    value={formData.customer_alternative_phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 9) handleInputChange('customer_alternative_phone', value);
                    }}
                    placeholder="+258 XX XXX XXXX"
                    maxLength={9}
                  />
                  {formData.customer_alternative_phone.length === 9 && !validateMpesaNumber(formData.customer_alternative_phone) && (
                    <p className="text-sm text-red-500">O número deve começar com 84 ou 85.</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <PaymentMethods
                formData={formData}
                handleInputChange={handleInputChange}
                validateMpesaNumber={validateMpesaNumber}
                formatCardNumber={formatCardNumber}
                validateExpiry={validateExpiry}
                validateCVV={validateCVV}
              />
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-muted/40 rounded-xl p-4 space-y-4">
                  <h3 className="font-bold text-lg">Resumo da Compra</h3>
                  <ScrollArea className="h-60 pr-2">
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 bg-white rounded-lg shadow-sm">
                          <div className="w-14 h-20 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={item.book.cover}
                              alt={item.book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-2">{item.book.title}</h4>
                            <p className="text-xs text-muted-foreground">{item.book.author}</p>
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="secondary">Qtd: {item.quantity}</Badge>
                              <span className="text-sm font-semibold">
                                {formatarValor(item.book.price * item.quantity)} MT
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatarValor(total)} MT</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total a Pagar</span>
                      <span className="text-primary">{formatarValor(total)} MT</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2">
                    <strong>Método escolhido:</strong> {formData.payment_method || '---'}
                    {formData.payment_method === 'Cartão' && (
                      <div>
                        <p>Cartão: {formData.card_number}</p>
                        <p>Validade: {formData.notes}</p>
                        <p>CVV: {formData.cvv}</p>
                      </div>
                    )}
                    {formData.payment_method === 'M-Pesa' && (
                      <p>Número M-Pesa: {formData.mobile_wallet_contact}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep} type="button">
                  Voltar
                </Button>
              ) : (
                <div />
              )}
              <Button
                type="submit"
                className="w-32"
                disabled={
                  loading ||
                  isProcessing ||
                  (step === 1 && (!formData.customer_name || !formData.customer_phone || (formData.customer_phone.length === 9 && !validateMpesaNumber(formData.customer_phone)))) ||
                  (step === 2 && !formData.payment_method) ||
                  (step === 2 && formData.payment_method === 'Cartão' && (!formData.card_number || !formData.notes || !formData.cvv)) ||
                  (step === 2 && formData.payment_method === 'M-Pesa' && (!formData.mobile_wallet_contact || (formData.mobile_wallet_contact.length === 9 && !validateMpesaNumber(formData.mobile_wallet_contact))))
                }
              >
                {step < 3 ? 'Próximo' : isProcessing ? 'Processando...' : confirmButtonText}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}