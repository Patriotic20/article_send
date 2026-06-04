import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelect } from "@/components/layout/LanguageSelect";

const TOTAL_STEPS = 4;

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [university, setUniversity] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const stepValid =
    step === 1
      ? university.trim().length > 0
      : step === 2
        ? firstName.trim().length > 0 && lastName.trim().length > 0
        : step === 3
          ? phone.trim().length > 0
          : email.trim().length > 0 && password.length >= 6;

  const titleKey = ["", "stepUniversity", "stepName", "stepPhone", "stepAccount"][
    step
  ];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepValid) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim(),
        university: university.trim(),
      });
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-end">
          <LanguageSelect />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("auth.registerTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("auth.stepIndicator", { n: step, total: TOTAL_STEPS })} ·{" "}
              {t(`auth.${titleKey}`)}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {step === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="university">{t("auth.university")}</Label>
                  <Input
                    id="university"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder={t("auth.otherUniversityPlaceholder")}
                    required
                    autoFocus
                  />
                </div>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("auth.phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998901234567"
                    required
                    autoFocus
                  />
                </div>
              )}

              {step === 4 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("auth.password")}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(step - 1)}
                    disabled={loading}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("auth.back")}
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!stepValid || loading}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {step < TOTAL_STEPS ? (
                    <>
                      {t("auth.next")}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    t("auth.signUp")
                  )}
                </Button>
              </div>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t("auth.haveAccount")}{" "}
              <Link to="/login" className="text-primary hover:underline">
                {t("auth.signIn")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
