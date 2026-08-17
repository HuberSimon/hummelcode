import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { QRCodeCanvas } from "qrcode.react";

import { auth } from "../../firebase";

import {
  createQRCode,
  getQRCodes,
  type QRCodeData,
} from "../../services/database/firestore-service";

import "./Dashboard.css";

const Dashboard = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [targetUrl, setTargetUrl] = useState("");

  const [showQr, setShowQr] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const APP_URL = window.location.origin;


  /**
   * QR-Codes laden
   */
  const loadQrCodes = async () => {
    try {
      setLoading(true);

      const data = await getQRCodes();

      setQrCodes(data);

    } catch (error) {
      console.error(
        "Fehler beim Laden der QR-Codes:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  /**
   * Firebase Login beobachten
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {

        if (!user) {
          setQrCodes([]);
          setLoading(false);
          return;
        }

        await loadQrCodes();
      }
    );

    return unsubscribe;
  }, []);


  /**
   * QR-Code erstellen
   */
  const handleCreateQRCode = async () => {
    const url = targetUrl.trim();

    if (!url) {
      alert("Bitte eine Zieladresse eingeben.");
      return;
    }

    if (
      !url.startsWith("https://") &&
      !url.startsWith("http://")
    ) {
      alert(
        "Bitte eine gültige URL eingeben.\n\n" +
        "Beispiel: https://example.com"
      );

      return;
    }

    try {
      setCreating(true);

      await createQRCode(url);

      setTargetUrl("");

      await loadQrCodes();

    } catch (error) {
      console.error(
        "Fehler beim Erstellen:",
        error
      );

      alert(
        "Der QR-Code konnte nicht erstellt werden."
      );

    } finally {
      setCreating(false);
    }
  };


  /**
   * URL des Tracking-QR-Codes
   */
  const getQRCodeUrl = (id: string) => {
    return `${APP_URL}/qr/${id}`;
  };


  /**
   * QR-Code anzeigen / schließen
   */
  const toggleQRCode = (id: string) => {
    setShowQr((current) => {
      if (current === id) {
        return null;
      }

      return id;
    });
  };


  /**
   * Logout
   */
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error(
        "Logout Fehler:",
        error
      );
    }
  };


  return (
    <main className="dashboard">

      <div className="dashboard-container">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>
            <h1>Dashboard</h1>

            <p>
              Verwalte deine QR-Codes und beobachte
              die Anzahl der Scans.
            </p>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Abmelden
          </button>

        </header>


        {/* QR-CODE ERSTELLEN */}

        <section className="create-card">

          <div className="create-card-header">

            <h2>QR-Code erstellen</h2>

            <p>
              Gib die Website ein, zu der der
              QR-Code weiterleiten soll.
            </p>

          </div>


          <div className="create-form">

            <input
              type="url"
              value={targetUrl}
              onChange={(event) =>
                setTargetUrl(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleCreateQRCode();
                }
              }}
              placeholder="https://example.com"
              disabled={creating}
            />

            <button
              className="create-button"
              onClick={handleCreateQRCode}
              disabled={creating}
            >
              {creating
                ? "Erstelle..."
                : "QR-Code erstellen"}
            </button>

          </div>

        </section>


        {/* QR-CODES */}

        <section className="qr-section">

          <div className="section-header">

            <div>

              <h2>Meine QR-Codes</h2>

              <p>
                {qrCodes.length === 0
                  ? "Noch keine QR-Codes vorhanden."
                  : `${qrCodes.length} QR-Code${
                      qrCodes.length === 1
                        ? ""
                        : "s"
                    }`}
              </p>

            </div>

          </div>


          {loading ? (

            <div className="loading">
              QR-Codes werden geladen...
            </div>

          ) : qrCodes.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                QR
              </div>

              <h3>
                Noch keine QR-Codes
              </h3>

              <p>
                Erstelle oben deinen ersten QR-Code.
              </p>

            </div>

          ) : (

            <div className="qr-list">

              {qrCodes.map((qr) => (

                <article
                  className="qr-item"
                  key={qr.id}
                >

                  <div className="qr-item-main">

                    {/* ZIELADRESSE */}

                    <div className="qr-target">

                      <span className="label">
                        Zieladresse
                      </span>

                      <a
                        href={qr.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="target-url"
                      >
                        {qr.targetUrl}
                      </a>

                    </div>


                    {/* COUNTER */}

                    <div className="qr-counter">

                      <span className="label">
                        Scans
                      </span>

                      <strong>
                        {qr.counter}
                      </strong>

                    </div>


                    {/* BUTTON */}

                    <div className="qr-actions">

                      <button
                        className="qr-button"
                        onClick={() =>
                          toggleQRCode(qr.id)
                        }
                      >
                        {showQr === qr.id
                          ? "QR-Code schließen"
                          : "QR-Code anzeigen"}
                      </button>

                    </div>

                  </div>


                  {/* QR PREVIEW */}

                  {showQr === qr.id && (

                    <div className="qr-preview">

                      <div className="qr-preview-code">

                        <QRCodeCanvas
                          value={getQRCodeUrl(qr.id)}
                          size={220}
                          level="H"
                          includeMargin
                        />

                      </div>


                      <div className="qr-preview-info">

                        <h3>
                          Dein QR-Code
                        </h3>

                        <p>
                          Beim Scannen wird zuerst
                          der Counter erhöht und
                          anschließend zur Zieladresse
                          weitergeleitet.
                        </p>


                        <div className="tracking-url">

                          <span>
                            Tracking-Adresse
                          </span>

                          <code>
                            {getQRCodeUrl(qr.id)}
                          </code>

                        </div>

                      </div>

                    </div>

                  )}

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
};

export default Dashboard;