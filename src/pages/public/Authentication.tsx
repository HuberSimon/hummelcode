import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth } from "../../firebase";

import {
  createUser,
  getUser,
} from "../../services/database/user-service";

import "./Authentication.css";


const Authentication: React.FC = () => {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();


  /**
   * Bestimmen, ob Login oder Registrierung
   */
  const initialMode =
    location.state?.mode
      ? location.state.mode === "register"
        ? false
        : true
      : true;

  const [isLogin, setIsLogin] =
    useState(initialMode);


  /**
   * Login / Registrierung
   */
  const handleSubmit = async () => {

    /*
     * Eingaben prüfen
     */
    if (
      !email ||
      !password ||
      (
        !isLogin &&
        (!firstName || !lastName)
      )
    ) {
      toast.error(
        "Bitte alle Felder ausfüllen"
      );

      return;
    }


    setLoading(true);


    try {

      /*
       * ==========================
       * LOGIN
       * ==========================
       */

      if (isLogin) {

        const result =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

        const firebaseUser = result.user;


        /*
         * User über user-service laden
         */
        const user = await getUser(
          firebaseUser.uid
        );


        /*
         * Kein User-Dokument
         */
        if (!user) {

          await auth.signOut();

          toast.error(
            "User nicht gefunden"
          );

          return;
        }


        /*
         * Account aktiviert?
         */
        if (!user.isEnabled) {

          await auth.signOut();

          toast.error(
            "Account ist deaktiviert - " +
            "Kontaktiere Simon, um deinen Account zu aktivieren"
          );

          return;
        }


        /*
         * Login erfolgreich
         */
        toast.success(
          "Willkommen zurück 👋"
        );

      }


      /*
       * ==========================
       * REGISTRIERUNG
       * ==========================
       */

      else {

        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        const firebaseUser =
          result.user;


        /*
         * Firebase Profil aktualisieren
         */
        await updateProfile(
          firebaseUser,
          {
            displayName: firstName,
          }
        );


        /*
         * User-Dokument über
         * user-service erstellen
         */
        await createUser({
          uid: firebaseUser.uid,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          isEnabled: false,
        });


        /*
         * Account wurde erstellt,
         * ist aber noch deaktiviert.
         */
        await auth.signOut();


        toast.success(
          "Account erstellt 🎉"
        );


        toast(
          "Dein Account muss noch aktiviert werden.",
          {
            icon: "ℹ️",
          }
        );


        /*
         * Zurück zum Login
         */
        setIsLogin(true);

        setPassword("");

        return;
      }


      /*
       * ==========================
       * DASHBOARD
       * ==========================
       */

      navigate("/dashboard");

    } catch (err: unknown) {

      console.error(
        "Authentication Fehler:",
        err
      );


      /*
       * Firebase Error Code auslesen
       */
      const error = err as {
        code?: string;
      };


      switch (error.code) {

        case "auth/user-not-found":

          toast.error(
            "Benutzer existiert nicht"
          );

          break;


        case "auth/invalid-credential":

          toast.error(
            "E-Mail oder Passwort ist falsch"
          );

          break;


        case "auth/invalid-email":

          toast.error(
            "Ungültige E-Mail Adresse"
          );

          break;


        case "auth/too-many-requests":

          toast.error(
            "Zu viele Versuche. " +
            "Bitte später erneut versuchen"
          );

          break;


        case "auth/email-already-in-use":

          toast.error(
            "E-Mail wird bereits verwendet"
          );

          break;


        case "auth/weak-password":

          toast.error(
            "Passwort ist zu schwach"
          );

          break;


        case "auth/network-request-failed":

          toast.error(
            "Netzwerkfehler. " +
            "Bitte überprüfe deine Internetverbindung."
          );

          break;


        default:

          toast.error(
            "Ein Fehler ist aufgetreten"
          );

          break;
      }

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="login-container">

      <h1>
        {isLogin
          ? "Login"
          : "Account erstellen"}
      </h1>


      {/* NAME */}

      {!isLogin && (

        <div className="login-container-name">

          <input
            type="text"
            placeholder="Vorname"
            value={firstName}
            onChange={(e) =>
              setFirstName(e.target.value)
            }
            disabled={loading}
          />


          <input
            type="text"
            placeholder="Nachname"
            value={lastName}
            onChange={(e) =>
              setLastName(e.target.value)
            }
            disabled={loading}
          />

        </div>

      )}


      {/* E-MAIL */}

      <input
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        disabled={loading}
        autoComplete="email"
      />


      {/* PASSWORT */}

      <input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        disabled={loading}
        autoComplete={
          isLogin
            ? "current-password"
            : "new-password"
        }
      />


      {/* PRIMARY BUTTON */}

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading}
        type="button"
      >
        {loading
          ? "..."
          : isLogin
            ? "Login"
            : "Registrieren"}
      </button>


      {/* DIVIDER */}

      <div className="login-divider">

        <span>oder</span>

      </div>


      {/* LOGIN / REGISTER WECHSELN */}

      <button
        className="btn-secondary"
        onClick={() =>
          setIsLogin(!isLogin)
        }
        type="button"
        disabled={loading}
      >
        {isLogin
          ? "Noch kein Account? Jetzt registrieren"
          : "Zurück zum Login"}
      </button>


      {/* HOME */}

      <button
        className="btn-tertiary"
        onClick={() =>
          navigate("/")
        }
        type="button"
      >
        ← Zurück zur Startseite
      </button>

    </div>
  );
};


export default Authentication;