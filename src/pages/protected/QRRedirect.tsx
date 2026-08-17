import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getQRCode,
  incrementQRCodeCounter,
} from "../../services/database/firestore-service";

import "./QRRedirect.css";

const QRRedirect = () => {
  const { id } = useParams<{ id: string }>();

  const [error, setError] = useState(false);

  // Verhindert doppelte Ausführung durch React StrictMode
  const hasProcessed = useRef(false);

  useEffect(() => {

    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(true);
      return;
    }

    // Bereits verarbeitet?
    if (hasProcessed.current) {
      return;
    }

    hasProcessed.current = true;


    const redirect = async () => {

      try {

        console.log("QR-Code wird verarbeitet:", id);

        // QR-Code laden
        const qrCode = await getQRCode(id);

        if (!qrCode) {

          console.error(
            "QR-Code nicht gefunden:",
            id
          );

          setError(true);
          return;
        }


        console.log(
          "Zieladresse:",
          qrCode.targetUrl
        );


        // Counter genau einmal erhöhen
        await incrementQRCodeCounter(id);


        console.log(
          "Counter wurde erhöht"
        );


        // Weiterleitung
        window.location.replace(
          qrCode.targetUrl
        );

      } catch (error) {

        console.error(
          "QR-Weiterleitung fehlgeschlagen:",
          error
        );

        setError(true);
      }
    };


    redirect();

  }, [id]);


  if (error) {

    return (
      <main className="qr-redirect">

        <div className="qr-redirect-content">

          <h1>
            QR-Code nicht gefunden
          </h1>

          <p>
            Dieser QR-Code existiert nicht
            oder ist nicht mehr verfügbar.
          </p>

        </div>

      </main>
    );
  }


  return (
    <main className="qr-redirect">

      <div className="qr-redirect-content">

        <div className="qr-loader" />

        <p>
          Weiterleitung...
        </p>

      </div>

    </main>
  );
};

export default QRRedirect;