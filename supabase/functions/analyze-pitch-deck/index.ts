import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body or handle empty body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { fileId, fileType } = body;
    
    if (!fileId) {
      console.error("Missing fileId parameter");
      return new Response(
        JSON.stringify({ error: "File ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Supabase client initialized with service role key");
    console.log("Processing file ID:", fileId);

    // Fetch file information
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      console.error("File fetch error:", fileError);
      return new Response(
        JSON.stringify({ error: "File not found", details: fileError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("File data retrieved:", fileData.name, "Path:", fileData.storage_path);

    // Verify and create the storage bucket if it doesn't exist
    try {
      const { data: buckets, error: listBucketsError } = await supabase.storage.listBuckets();
      
      if (listBucketsError) {
        console.error("Error listing buckets:", listBucketsError);
        throw new Error("Failed to access storage buckets");
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'pitch-decks');
      
      if (!bucketExists) {
        console.log('Creating pitch-decks bucket in edge function using service role key');
        const { data: createData, error: createError } = await supabase.storage.createBucket('pitch-decks', {
          public: false,
          allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (createError) {
          console.error("Error creating bucket with service role:", createError);
          throw new Error("Failed to create storage bucket with service role");
        }
        
        console.log("Successfully created pitch-decks bucket");
        
        // Set up bucket policies to allow authenticated users to upload and read files
        const { error: policyError } = await supabase.storage.from('pitch-decks').createPolicy(
          'authenticated-read-write',
          {
            name: 'authenticated-read-write',
            definition: {
              type: 'user',
              roles: ['authenticated'],
              permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
            },
          }
        );
        
        if (policyError) {
          console.error("Error setting bucket policy:", policyError);
          // Continue anyway as we can still use the bucket with service role
        } else {
          console.log("Successfully set bucket policy");
        }
      } else {
        console.log("Pitch-decks bucket already exists");
      }
    } catch (bucketError) {
      console.error("Bucket verification error:", bucketError);
      // Continue anyway as we'll use the service role for file operations
    }

    // Download file from storage using service role
    console.log("Attempting to download file from path:", fileData.storage_path);
    const { data: fileContent, error: downloadError } = await supabase
      .storage
      .from('pitch-decks')
      .download(fileData.storage_path);

    if (downloadError) {
      console.error("File download error:", downloadError);
      return new Response(
        JSON.stringify({ error: "Failed to download file", details: downloadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!fileContent) {
      console.error("File content is empty");
      return new Response(
        JSON.stringify({ error: "Empty file content" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("File downloaded successfully");

    // Extract text from file (simplified - in a real implementation you'd use a proper parsing library)
    // For this example, we'll simulate extracted content based on file type
    const extractedText = `This is simulated text extraction from the ${fileData.file_type === 'application/pdf' ? 'PDF' : 'PPTX'}: ${fileData.name}.
    Common pitch deck sections include:
    - Company Overview
    - Problem Statement
    - Solution Description
    - Market Opportunity
    - Business Model
    - Competition Analysis
    - Team Background
    - Financial Projections
    - Funding Request`;

    // Create a new analysis record
    console.log("Creating analysis record");
    const { data: analysis, error: analysisError } = await supabase
      .from('pitch_deck_analyses')
      .insert({
        file_id: fileId,
        title: fileData.name,
        status: 'processing',
        file_type: fileData.file_type,
        upload_date: new Date().toISOString()
      })
      .select()
      .single();

    if (analysisError) {
      console.error("Analysis record creation error:", analysisError);
      return new Response(
        JSON.stringify({ error: "Failed to create analysis record", details: analysisError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!analysis) {
      console.error("Analysis record is null after creation");
      return new Response(
        JSON.stringify({ error: "Failed to create analysis record - null result" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Analysis record created with ID:", analysis.id);

    // Use OpenAI to analyze the pitch deck
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error("Missing OpenAI API key");
      
      // Update the analysis status to failed
      await supabase
        .from('pitch_deck_analyses')
        .update({ status: 'failed' })
        .eq('id', analysis.id);
      
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const prompt = `
    You are a venture capital expert analyzing a startup pitch deck. 
    The extracted text from the ${fileData.file_type === 'application/pdf' ? 'PDF' : 'PPTX'} pitch deck is:
    
    ${extractedText}
    
    Please analyze this pitch deck and provide the following:
    1. An overall score from 1-10
    2. Strengths of the pitch deck
    3. Weaknesses that need improvement
    4. Specific scores (1-10) for the following categories:
       - Problem Definition
       - Solution Clarity
       - Market Analysis
       - Business Model
       - Team Qualifications
       - Financial Projections
       - Visual Design and Clarity
    5. Specific improvement recommendations
    
    Format your response as valid JSON with the following structure:
    {
      "overallScore": number,
      "strengths": [string, string, ...],
      "weaknesses": [string, string, ...],
      "metrics": {
        "problemDefinition": { "score": number, "feedback": string },
        "solutionClarity": { "score": number, "feedback": string },
        "marketAnalysis": { "score": number, "feedback": string },
        "businessModel": { "score": number, "feedback": string },
        "teamQualifications": { "score": number, "feedback": string },
        "financialProjections": { "score": number, "feedback": string },
        "visualDesign": { "score": number, "feedback": string }
      },
      "recommendations": [string, string, ...]
    }
    `;

    try {
      console.log("Calling OpenAI API");
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a venture capital expert who analyzes startup pitch decks. Respond with JSON only, no markdown.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        console.error("OpenAI API error status:", openAIResponse.status);
        console.error("OpenAI API error response:", errorText);
        
        // Update analysis status to failed
        await supabase
          .from('pitch_deck_analyses')
          .update({ status: 'failed' })
          .eq('id', analysis.id);
          
        return new Response(
          JSON.stringify({ error: "AI analysis failed", details: `API Error: ${openAIResponse.status} - ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const openAIData = await openAIResponse.json();
      console.log("OpenAI response received");
      
      if (!openAIData || !openAIData.choices || openAIData.choices.length === 0 || !openAIData.choices[0].message) {
        console.error("Invalid OpenAI response structure:", openAIData);
        
        // Update analysis status to failed
        await supabase
          .from('pitch_deck_analyses')
          .update({ status: 'failed' })
          .eq('id', analysis.id);
          
        return new Response(
          JSON.stringify({ error: "Invalid AI response format", details: "The AI response didn't match the expected structure" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get the raw content from OpenAI response
      let responseContent = openAIData.choices[0].message.content;
      console.log("Raw response content:", responseContent);
      
      // Extract JSON from the content if wrapped in markdown code blocks
      if (responseContent.includes('```json')) {
        responseContent = responseContent.replace(/```json\n|\n```/g, '');
      } else if (responseContent.includes('```')) {
        responseContent = responseContent.replace(/```\n|\n```/g, '');
      }
      
      // Parse the JSON response
      let analysisResult;
      try {
        analysisResult = JSON.parse(responseContent);
        console.log("Successfully parsed analysis result");
      } catch (jsonError) {
        console.error("Error parsing JSON from OpenAI response:", jsonError);
        console.log("Raw response content that couldn't be parsed:", responseContent);
        
        // Update analysis status to failed
        await supabase
          .from('pitch_deck_analyses')
          .update({ status: 'failed' })
          .eq('id', analysis.id);
          
        return new Response(
          JSON.stringify({ 
            error: "Failed to parse AI analysis result", 
            details: jsonError.message, 
            rawResponse: responseContent.substring(0, 500) // First 500 characters for debugging
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate the analysis result structure
      if (!analysisResult || typeof analysisResult.overallScore !== 'number' || !analysisResult.metrics) {
        console.error("Invalid analysis result structure:", analysisResult);
        
        // Update analysis status to failed
        await supabase
          .from('pitch_deck_analyses')
          .update({ status: 'failed' })
          .eq('id', analysis.id);
          
        return new Response(
          JSON.stringify({ 
            error: "Invalid analysis structure", 
            details: "The AI response didn't include the required fields",
            structure: Object.keys(analysisResult || {}).join(', ')
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update the analysis record with the results
      console.log("Updating analysis record with results");
      const { error: updateError } = await supabase
        .from('pitch_deck_analyses')
        .update({ 
          analysis: analysisResult,
          status: 'completed'
        })
        .eq('id', analysis.id);
        
      if (updateError) {
        console.error("Error updating analysis record:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to save analysis results", details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Add metrics to the pitch_deck_metrics table
      try {
        const metricsToInsert = Object.entries(analysisResult.metrics).map(([key, value]: [string, any]) => ({
          analysis_id: analysis.id,
          metric_name: key,
          score: value.score,
          feedback: value.feedback
        }));

        console.log("Inserting metrics into pitch_deck_metrics table");
        const { error: metricsError } = await supabase
          .from('pitch_deck_metrics')
          .insert(metricsToInsert);
          
        if (metricsError) {
          console.error("Error inserting metrics:", metricsError);
          // Non-critical error, continue with the response
        }
      } catch (metricsError) {
        console.error("Error processing metrics:", metricsError);
        // Non-critical error, continue with the response
      }

      // Return success response
      console.log("Successfully completed analysis");
      return new Response(
        JSON.stringify({ 
          success: true,
          analysis: {
            id: analysis.id,
            title: analysis.title,
            status: 'completed',
            result: {} // Replace with actual analysis result in a real implementation
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      
      // Update analysis status to failed
      await supabase
        .from('pitch_deck_analyses')
        .update({ status: 'failed' })
        .eq('id', analysis.id);
        
      return new Response(
        JSON.stringify({ error: "Failed to analyze with AI", details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error("Error in analyze-pitch-deck function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
