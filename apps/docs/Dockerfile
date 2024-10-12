FROM python:3-alpine

# Set the working directory inside the container
WORKDIR /docs

# Install MkDocs and the Material theme
RUN pip install mkdocs mkdocs-material

# Copy the mkdocs configuration file
COPY mkdocs.yml .

# Copy the 'docs' directory containing your Markdown files
COPY docs ./docs

# Expose port 8000 for MkDocs' live server
EXPOSE 8000

# Command to serve the MkDocs site
CMD ["mkdocs", "serve", "-a", "0.0.0.0:8000"]
