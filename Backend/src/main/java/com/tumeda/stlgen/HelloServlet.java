package com.tumeda.stlgen;

import java.io.*;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;

@WebServlet("/generate")
public class HelloServlet extends HttpServlet {
    private String message;

    public void init() {
        message = "";
    }
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        setAccessControlHeaders(response);
        response.setStatus(HttpServletResponse.SC_OK);
    }
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
       this.doPost(request, response);
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        setAccessControlHeaders(response);
        try{
            /*BufferedReader reader = request.getReader();
            String line = reader.readLine();
            while (line != null) {
                message += line;
                line = reader.readLine();
            }
            reader.close();*/
            RequestDispatcher rd = request.getRequestDispatcher("index.jsp");
            rd.forward(request, response);
        }catch (Exception e){
            response.sendError(400, "Error during receiving the JSON file: " + e.getMessage());
            return;
        }

    }

    private void setAccessControlHeaders(HttpServletResponse response) {

        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "*");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Connection", "close");
    }

    public void destroy() {
    }
}