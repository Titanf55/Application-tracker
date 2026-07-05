package com.tracker.app.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    public List<String> extractSkills(String jobDescription) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return getMockSkills();
        }

        String prompt = "Analyze the following job description and extract key programming languages, frameworks, " +
                "databases, and developer tools required. " +
                "Output ONLY a raw JSON array of strings containing the skill names (e.g. [\"React\", \"Java\"]), and nothing else. " +
                "Do not include markdown code block formatting (like ```json). " +
                "Job Description:\n" + jobDescription;

        try {
            String rawResponse = callGemini(prompt);
            String cleanedResponse = cleanJsonResponse(rawResponse);
            return objectMapper.readValue(cleanedResponse, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            System.err.println("Gemini API call failed, falling back to mock skills: " + e.getMessage());
            return getMockSkills();
        }
    }

    public List<String> generatePrepQuestions(String companyName, String role, String jobDescription) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return getMockQuestions(companyName, role);
        }

        String prompt = String.format(
                "Generate exactly 5 tailored practice interview questions (a mix of technical and behavioral) " +
                "for a candidate applying for the role of '%s' at '%s', based on this job description:\n%s\n\n" +
                "Output ONLY a raw JSON array of strings containing the questions, and nothing else. " +
                "Do not include markdown code block formatting (like ```json).",
                role, companyName, jobDescription
        );

        try {
            String rawResponse = callGemini(prompt);
            String cleanedResponse = cleanJsonResponse(rawResponse);
            return objectMapper.readValue(cleanedResponse, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            System.err.println("Gemini API call failed, falling back to mock questions: " + e.getMessage());
            return getMockQuestions(companyName, role);
        }
    }

    public Map<String, Object> calculateMatchScore(String resumeText, String jobDescription) {
        if (apiKey == null || apiKey.trim().isEmpty() || resumeText == null || resumeText.trim().isEmpty()) {
            return getMockMatchResult();
        }

        String prompt = String.format(
                "Compare the following candidate's resume highlights against the job description.\n\n" +
                "Resume Highlights:\n%s\n\n" +
                "Job Description:\n%s\n\n" +
                "Analyze compatibility and output ONLY a raw JSON object with two fields:\n" +
                "1. 'score': an integer from 0 to 100 representing matching percentage\n" +
                "2. 'gaps': a list of strings representing key skills, experiences, or requirements missing from the resume.\n\n" +
                "Example format: {\"score\": 75, \"gaps\": [\"Docker\", \"Kubernetes\"]}\n" +
                "Output ONLY this raw JSON object and nothing else. Do not include markdown code block formatting.",
                resumeText, jobDescription
        );

        try {
            String rawResponse = callGemini(prompt);
            String cleanedResponse = cleanJsonResponse(rawResponse);
            return objectMapper.readValue(cleanedResponse, Map.class);
        } catch (Exception e) {
            System.err.println("Gemini API call failed, falling back to mock match score: " + e.getMessage());
            return getMockMatchResult();
        }
    }

    private String callGemini(String prompt) throws Exception {
        String url = GEMINI_API_URL + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build Gemini Request Payload structure
        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> parts = Map.of("parts", List.of(textPart));
        Map<String, Object> content = Map.of("contents", List.of(parts));

        String jsonPayload = objectMapper.writeValueAsString(content);
        HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

        String rawResponse = restTemplate.postForObject(url, entity, String.class);
        return parseGeminiResponseText(rawResponse);
    }

    private String parseGeminiResponseText(String jsonResponse) throws Exception {
        Map<String, Object> map = objectMapper.readValue(jsonResponse, Map.class);
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) map.get("candidates");
        if (candidates != null && !candidates.isEmpty()) {
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content != null) {
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
        }
        throw new RuntimeException("Could not extract text from Gemini response");
    }

    private String cleanJsonResponse(String response) {
        String cleaned = response.trim();
        // Remove ```json wrapper if present
        if (cleaned.startsWith("```")) {
            int firstNewline = cleaned.indexOf('\n');
            if (firstNewline != -1) {
                cleaned = cleaned.substring(firstNewline + 1);
            }
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3).trim();
        }
        return cleaned.trim();
    }

    // --- FALLBACK MOCK DATA ---

    private List<String> getMockSkills() {
        return List.of("Java", "Spring Boot", "React", "TypeScript", "PostgreSQL", "REST APIs", "Git");
    }

    private List<String> getMockQuestions(String companyName, String role) {
        return List.of(
                String.format("Why do you want to join %s as a %s?", companyName, role),
                "Can you walk me through a complex technical challenge you solved in a previous project?",
                "Explain the difference between SQL and NoSQL databases. When would you choose PostgreSQL?",
                "How do you handle state management in a large-scale React application?",
                "What is your approach to resolving conflict within an engineering team?"
        );
    }

    private Map<String, Object> getMockMatchResult() {
        return Map.of(
                "score", 70,
                "gaps", List.of("Docker & Containerization", "AWS Deployment", "CI/CD Pipelines (Github Actions)")
        );
    }
}
