import { exec } from "child_process";

export default function handler(req, res) {
  exec("java -version", (error, stdout, stderr) => {
    if (error) {
      res.status(200).json({
        java_instalado: false,
        error: error.message
      });
      return;
    }

    res.status(200).json({
      java_instalado: true,
      salida: stderr || stdout
    });
  });
}
